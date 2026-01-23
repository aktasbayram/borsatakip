/**
 * Price Alarm Worker
 * 
 * Usage: npx ts-node --project tsconfig.script.json scripts/price_alarm_worker.ts
 */

import { PrismaClient } from '@prisma/client';
import { MarketService } from '../src/services/market/index';
import { EmailService } from '../src/services/notification/email';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
import { TelegramService } from '../src/lib/telegram';

let lastUpdateId = 0;


const CHECK_INTERVAL_MS = 60 * 1000; // Check every 60 seconds
const COOLDOWN_MINUTES = 5;

console.log("🚀 Price Alarm Worker started...");
console.log(`⏱️ Check interval: ${CHECK_INTERVAL_MS / 1000}s`);

async function checkTelegramUpdates() {
    try {
        const updates = await TelegramService.getUpdates(lastUpdateId + 1);
        if (updates && Array.isArray(updates) && updates.length > 0) {
            console.log(`📨 Received ${updates.length} Telegram updates.`);
            for (const update of updates) {
                lastUpdateId = update.update_id;

                if (update.message && update.message.text) {
                    const text = update.message.text.trim();
                    const chatId = update.message.chat.id.toString();

                    if (text.startsWith('/start ')) {
                        const code = text.split(' ')[1];
                        if (code) {
                            console.log(`🔍 Checking verification code: ${code}`);
                            // Find user with this code
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
                                await TelegramService.sendMessage(chatId, "✅ Hesabınız başarıyla eşleştirildi! Artık fiyat alarmlarını buradan alacaksınız.");
                                console.log(`✅ Linked Chat ID ${chatId} to user ${settings.userId}`);
                            } else {
                                await TelegramService.sendMessage(chatId, "❌ Geçersiz veya süresi dolmuş kod.");
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error checking Telegram updates:", error);
    }
}


async function checkAlarms() {
    try {
        console.log(`\n[${new Date().toISOString()}] Checking active alerts...`);

        // 1. Fetch active alerts with user settings and last log
        const activeAlerts = await prisma.alert.findMany({
            where: { status: 'ACTIVE' },
            include: {
                user: {
                    include: {
                        notificationSettings: true
                    }
                },
                logs: {
                    take: 1,
                    orderBy: { triggeredAt: 'desc' }
                }
            }
        });

        if (activeAlerts.length === 0) {
            console.log("No active alerts found.");
            return;
        }

        console.log(`Found ${activeAlerts.length} active alerts.`);

        // 2. Group by symbol to optimize price fetching
        const symbolsObj: Record<string, { symbol: string, market: 'BIST' | 'US' }> = {};
        activeAlerts.forEach((alert: any) => {
            symbolsObj[`${alert.market}:${alert.symbol}`] = {
                symbol: alert.symbol,
                market: alert.market
            };
        });

        // 3. Fetch current prices
        const prices = new Map<string, number>();
        const uniqueSymbols = Object.values(symbolsObj);
        console.log(`Fetching prices for ${uniqueSymbols.length} unique symbols...`);

        await Promise.all(
            uniqueSymbols.map(async ({ symbol, market }) => {
                try {
                    const quote = await MarketService.getQuote(symbol, market);
                    if (quote && quote.price) {
                        prices.set(`${market}:${symbol}`, quote.price);
                    }
                } catch (error) {
                    console.error(`Failed to get price for ${symbol}:`, error instanceof Error ? error.message : error);
                }
            })
        );

        // 4. Check conditions and trigger
        for (const alert of activeAlerts) {
            const priceKey = `${alert.market}:${alert.symbol}`;
            const currentPrice = prices.get(priceKey);

            if (currentPrice === undefined) continue;

            let isTriggered = false;
            if (alert.type === 'PRICE_ABOVE' && currentPrice >= alert.target) {
                isTriggered = true;
            } else if (alert.type === 'PRICE_BELOW' && currentPrice <= alert.target) {
                isTriggered = true;
            }

            if (isTriggered) {
                console.log(`⚡ Triggered: ${alert.symbol} @ ${currentPrice} (Target: ${alert.target})`);

                // Anti-Spam Check
                const lastLog = alert.logs[0];
                if (lastLog) {
                    const minutesSinceLastTrigger = (Date.now() - new Date(lastLog.triggeredAt).getTime()) / (1000 * 60);
                    if (minutesSinceLastTrigger < COOLDOWN_MINUTES) {
                        console.log(`   ⏳ Cooldown active (${minutesSinceLastTrigger.toFixed(1)}m < ${COOLDOWN_MINUTES}m). Skipping notification.`);
                        continue;
                    }
                }

                // Create Log
                await prisma.alertLog.create({
                    data: {
                        alertId: alert.id,
                        message: `Fiyat hedefi yakalandı: ${currentPrice} (Hedef: ${alert.target})`
                    }
                });

                // Send Email
                const notifSettings = alert.user.notificationSettings;

                // 1. Telegram Notification
                if (notifSettings?.telegramEnabled && notifSettings.telegramChatId) {
                    console.log(`   📱 Sending Telegram message to ${notifSettings.telegramChatId}...`);
                    const message = `🔔 *FİYAT ALARMI*\n\n` +
                        `📈 *${alert.symbol}* hedef fiyata ulaştı.\n` +
                        `💰 Güncel: ${currentPrice}\n` +
                        `🎯 Hedef: ${alert.target}\n` +
                        `📊 Yön: ${alert.type === 'PRICE_ABOVE' ? 'Yukarı' : 'Aşağı'}`;

                    await TelegramService.sendMessage(notifSettings.telegramChatId, message);
                }

                // 2. Email Notification
                if (notifSettings?.emailEnabled && notifSettings.smtpHost && notifSettings.smtpUser) {
                    console.log(`   📧 Sending email to ${alert.user.email}...`);

                    const success = await EmailService.sendWithConfig(
                        {
                            host: notifSettings.smtpHost,
                            port: notifSettings.smtpPort || 587,
                            user: notifSettings.smtpUser || undefined,
                            pass: notifSettings.smtpPassword || undefined,
                            secure: notifSettings.smtpSecure
                        },
                        {
                            to: alert.user.email,
                            subject: `🔔 Fiyat Alarmı: ${alert.symbol}`,
                            html: `
                                <h3>Fiyat Hedefi Yakalandı!</h3>
                                <p>Takip ettiğiniz <strong>${alert.symbol}</strong> hissesi hedef fiyatınıza ulaştı.</p>
                                <ul>
                                    <li><strong>Güncel Fiyat:</strong> ${currentPrice}</li>
                                    <li><strong>Hedef Fiyat:</strong> ${alert.target}</li>
                                    <li><strong>Yön:</strong> ${alert.type === 'PRICE_ABOVE' ? 'Yukarı' : 'Aşağı'}</li>
                                </ul>
                                <p>Borsa Takip Sistemi</p>
                            `
                        }
                    );

                    if (success) {
                        console.log("   ✅ Email sent successfully.");
                    } else {
                        console.error("   ❌ Failed to send email.");
                    }
                } else {
                    console.log("   ⚠️ Email notifications disabled or unconfigured for user.");
                }
            }
        }

    } catch (error) {
        console.error("Error in worker loop:", error);
    }
}

// Start the loop
async function run() {
    await checkAlarms(); // Initial run

    // Main loop
    setInterval(async () => {
        await checkTelegramUpdates();
        await checkAlarms();
    }, CHECK_INTERVAL_MS);

    // Check telegram updates more frequently (every 5s)
    setInterval(checkTelegramUpdates, 5000);
}

run();
