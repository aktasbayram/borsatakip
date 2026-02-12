
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';
import { sendTelegramMessage } from '../src/lib/notifications';
import { TelegramService } from '../src/lib/telegram';
import { IpoService } from '../src/services/market/ipo-service';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Helper to get quote (simplified version of MarketService for script)
async function getQuote(symbol: string, market: string): Promise<number | null> {
    try {
        if (market === 'BIST') {
            const s = symbol.endsWith('.IS') ? symbol : `${symbol}.IS`;
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${s}?interval=1d&range=1d`;
            const res = await axios.get(url);
            const price = res.data.chart.result[0].meta.regularMarketPrice;
            return price;
        } else {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
            const res = await axios.get(url);
            const price = res.data.chart.result[0].meta.regularMarketPrice;
            return price;
        }
    } catch (error) {
        console.error(`Failed to fetch price for ${symbol}:`, error instanceof Error ? error.message : error);
        return null;
    }
}

async function checkAlerts() {
    // console.log(`Checking active alerts at ${new Date().toISOString()}...`);

    const alerts = await prisma.alert.findMany({
        where: {
            status: 'ACTIVE',
        },
        include: {
            user: {
                include: {
                    notificationSettings: true
                }
            }
        }
    });

    for (const alert of alerts) {
        if (alert.lastTriggeredAt) {
            const now = new Date();
            const diffSeconds = (now.getTime() - alert.lastTriggeredAt.getTime()) / 1000;
            if (diffSeconds < alert.cooldown) {
                // console.log(`Skipping ${alert.symbol}: Cooldown active (${Math.round(diffSeconds)}/${alert.cooldown}s)`);
                continue;
            }
        }

        const currentPrice = await getQuote(alert.symbol, alert.market);

        if (currentPrice === null) continue;

        let triggered = false;
        if (alert.type === 'PRICE_ABOVE' && currentPrice >= alert.target) triggered = true;
        else if (alert.type === 'PRICE_BELOW' && currentPrice <= alert.target) triggered = true;

        if (triggered) {
            console.log(`⚠️ ALERT TRIGGERED: ${alert.symbol} is ${currentPrice} (Target: ${alert.target})`);

            const message = `🚨 *FİYAT ALARMI* 🚨\n\n📌 *${alert.symbol}*\n💰 Güncel Fiyat: ${currentPrice}\n🎯 Hedef: ${alert.target}\n\nAlarmınız tetiklendi!`;

            if (alert.user.notificationSettings) {
                const { telegramEnabled, telegramChatId, siteEnabled } = alert.user.notificationSettings;

                // 1. Telegram Notification
                if (telegramEnabled && telegramChatId) {
                    await sendTelegramMessage(telegramChatId, message);
                }

                // 2. Site Notification
                if (siteEnabled !== false) { // Default to true if undefined, though schema default is true
                    await prisma.notification.create({
                        data: {
                            userId: alert.userId,
                            title: `Fiyat Alarmı: ${alert.symbol}`,
                            message: `${alert.symbol} hissesi ${currentPrice} fiyatına ulaştı. (Hedef: ${alert.target})`,
                            type: 'WARNING',
                            sendBrowser: true,  // Enable browser notifications
                            sendInApp: true     // Enable in-app toast notifications
                        }
                    });
                }
            }

            const newTriggers = alert.currentTriggers + 1;
            const updates: any = {
                currentTriggers: newTriggers,
                lastTriggeredAt: new Date(),
            };

            if (newTriggers >= alert.triggerLimit) {
                updates.status = 'COMPLETED';
            }

            await prisma.alert.update({
                where: { id: alert.id },
                data: updates
            });

            await prisma.alertLog.create({
                data: {
                    alertId: alert.id,
                    message: `Alarm tetiklendi. Fiyat: ${currentPrice}`
                }
            });
        }
        await new Promise(r => setTimeout(r, 200)); // Rate limit per symbol
    }
}

async function handleTelegramUpdates(offset: number) {
    // console.log(`Checking updates offset: ${offset}`);
    const updates = await TelegramService.getUpdates(offset);
    if (!updates || updates.length === 0) return offset;

    let maxId = offset;
    for (const update of updates) {
        maxId = Math.max(maxId, update.update_id + 1);

        if (!update.message || !update.message.text) continue;

        const chatId = update.message.chat.id.toString();
        const text = update.message.text.trim();

        console.log(`Received message from ${chatId}: ${text}`);

        // Handle /start CODE
        if (text.startsWith('/start ')) {
            const code = text.split(' ')[1];
            if (code) {
                const settings = await prisma.notificationSettings.findFirst({
                    where: { verificationCode: code }
                });

                if (settings) {
                    await prisma.notificationSettings.update({
                        where: { id: settings.id },
                        data: {
                            telegramChatId: chatId,
                            telegramEnabled: true,
                            verificationCode: null // Consume code
                        }
                    });

                    await TelegramService.sendMessage(chatId, "✅ *Başarıyla Bağlandınız!* \n\nArtık Borsa Takip bildirimlerini buradan alacaksınız.");
                    console.log(`User ${settings.userId} verified via Telegram: ${chatId}`);
                } else {
                    await TelegramService.sendMessage(chatId, "❌ *Hata:* Geçersiz veya süresi dolmuş kod.");
                }
            }
        }
    }
    return maxId;
}

async function runWorker() {
    console.log("Starting Borsa Worker (Alerts + Telegram Bot)...");
    let updateOffset = 0;
    let lastIpoSync = 0;

    // Main Loop
    while (true) {
        try {
            // Price Alerts
            await checkAlerts();

            // Telegram Bot
            updateOffset = await handleTelegramUpdates(updateOffset);

            // Periodic IPO Sync (every 6 hours)
            const now = Date.now();
            if (now - lastIpoSync > 6 * 60 * 60 * 1000) {
                console.log(`[${new Date().toISOString()}] Starting periodic IPO sync...`);
                try {
                    const result = await IpoService.syncIpos();
                    console.log(`[${new Date().toISOString()}] IPO sync completed: Added ${result.added}, Updated ${result.updated}, Errors ${result.errors}`);
                    lastIpoSync = now;
                } catch (syncError) {
                    console.error("Periodic IPO Sync Error:", syncError);
                    // Retry in 30 minutes on failure
                    lastIpoSync = now - (5.5 * 60 * 60 * 1000);
                }
            }

        } catch (error) {
            console.error("Worker Error:", error);
        }

        // Wait 1 seconds
        await new Promise(r => setTimeout(r, 1000));
    }
}

// Start
runWorker()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
