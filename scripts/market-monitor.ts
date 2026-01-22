
import { prisma } from '../src/lib/db';
import yahooFinance from 'yahoo-finance2';
import { TelegramService } from '../src/lib/telegram';
import { EmailService } from '../src/lib/email';

// Symbols to always track for Global Alerts
const GLOBAL_SYMBOLS = ['XU100.IS', 'TRY=X', 'GC=F'];

// Map to store last update ID to avoid processing same messages
let lastUpdateId = 0;

async function checkTelegramLinking() {
    // 1. Get Updates
    const updates = await TelegramService.getUpdates(lastUpdateId + 1);
    if (!updates || updates.length === 0) return;

    for (const update of updates) {
        lastUpdateId = update.update_id;

        if (update.message && update.message.text && update.message.text.startsWith('/start ')) {
            const code = update.message.text.split(' ')[1];
            const chatId = update.message.chat.id.toString();

            // Find user with this verification code
            const settings = await prisma.notificationSettings.findFirst({
                where: { verificationCode: code }
            });

            if (settings) {
                console.log(`Linking Telegram ${chatId} to user ${settings.userId}`);
                await prisma.notificationSettings.update({
                    where: { id: settings.id },
                    data: {
                        telegramChatId: chatId,
                        telegramEnabled: true,
                        verificationCode: null // Clear code after use
                    }
                });
                await TelegramService.sendMessage(chatId, "✅ Başarıyla bağlandı! Artık piyasa bildirimlerini buradan alacaksınız.");
            } else {
                await TelegramService.sendMessage(chatId, "⚠️ Geçersiz kod. Lütfen Borsa Takip ayarlarından yeni bir kod alın.");
            }
        }
    }
}

async function checkMarket() {
    console.log("Checking market prices...");

    // Check for new telegram links
    await checkTelegramLinking();

    // 1. Fetch Prices
    const symbolsToCheck = [...GLOBAL_SYMBOLS];
    // In a real app, we'd also fetch all unique symbols from active User Alerts to minimize API calls

    // Explicitly casting because in this CJS/TS-Node env, yahooFinance is the Class constructor
    const yf = new (yahooFinance as any)();
    const quotes = await yf.quote(symbolsToCheck) as any[];
    const priceMap = new Map(quotes.map((q: any) => [q.symbol, q]));

    // 2. Check Global Alerts
    const activeGlobalAlerts = await prisma.globalMarketAlert.findMany({
        where: { isActive: true },
        include: { user: { include: { notificationSettings: true } } }
    });

    for (const alert of activeGlobalAlerts) {
        const quote = priceMap.get(alert.symbol);
        if (!quote) continue;

        let triggered = false;
        let message = "";

        // Check conditions
        if (alert.type === 'PERCENT_CHANGE_DROP' && quote.regularMarketChangePercent && quote.regularMarketChangePercent <= -alert.threshold) {
            triggered = true;
            message = `⚠️ PİYASA UYARISI: ${alert.symbol} %${quote.regularMarketChangePercent.toFixed(2)} düştü! (Eşik: -%${alert.threshold})`;
        } else if (alert.type === 'PERCENT_CHANGE_RISE' && quote.regularMarketChangePercent && quote.regularMarketChangePercent >= alert.threshold) {
            triggered = true;
            message = `🚀 PİYASA UYARISI: ${alert.symbol} %${quote.regularMarketChangePercent.toFixed(2)} yükseldi! (Eşik: +%${alert.threshold})`;
        }

        if (triggered) {
            // Check cooldown
            if (alert.lastTriggeredAt) {
                const diffMinutes = (Date.now() - alert.lastTriggeredAt.getTime()) / 1000 / 60;
                if (diffMinutes < alert.cooldown) continue;
            }

            console.log(`Triggering alert for user ${alert.userId}: ${message}`);

            // Send Notifications
            const settings = alert.user.notificationSettings;
            if (settings?.telegramEnabled && settings.telegramChatId) {
                await TelegramService.sendMessage(settings.telegramChatId, message);
            }
            if (settings?.emailEnabled && alert.user.email) {
                await EmailService.sendAlertEmail(alert.user.email, `Piyasa Uyarısı: ${alert.symbol}`, `<p>${message}</p>`);
            }

            // Update lastTriggeredAt
            await prisma.globalMarketAlert.update({
                where: { id: alert.id },
                data: { lastTriggeredAt: new Date() }
            });
        }
    }

    // 3. User Specific Alerts (TODO: Implement granular price alerts)
    // ...
}

// Run immediately then exit (can be loop)
checkMarket()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
