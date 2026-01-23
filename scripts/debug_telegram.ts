
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function debugTelegram() {
    console.log("🔍 Debugging Telegram Bot...");
    console.log(`Token ends with: ...${TELEGRAM_BOT_TOKEN?.slice(-5)}`);

    if (!TELEGRAM_BOT_TOKEN) {
        console.error("❌ TELEGRAM_BOT_TOKEN is missing!");
        return;
    }

    const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

    // 1. Check Webhook Status
    try {
        const res = await axios.get(`${TELEGRAM_API_URL}/getWebhookInfo`);
        console.log("\n📡 Webhook Info:");
        console.log(JSON.stringify(res.data, null, 2));

        if (res.data.result.url) {
            console.warn("⚠️ WARNING: A webhook is set! 'getUpdates' will NOT work while a webhook is active.");
            console.log("To fix this, we need to delete the webhook.");
            // Optional: Uncomment to delete
            // await axios.post(`${TELEGRAM_API_URL}/deleteWebhook`);
            // console.log("Webhook deleted.");
        }
    } catch (e: any) {
        console.error("Failed to get webhook info:", e.message);
    }

    // 2. Try getUpdates
    try {
        console.log("\n📨 Testing getUpdates...");
        const res = await axios.get(`${TELEGRAM_API_URL}/getUpdates`, {
            params: { offset: 0, timeout: 5 }
        });
        const updates = res.data.result;

        console.log(`Received ${updates?.length || 0} updates.`);
        if (updates) {
            updates.forEach((u: any) => {
                console.log(`- Update ID: ${u.update_id}`);
                console.log(`  Message: ${u.message?.text}`);
                console.log(`  Chat ID: ${u.message?.chat?.id}`);
            });
        }
    } catch (e: any) {
        console.error("Failed to get updates:", e.response ? e.response.data : e.message);
    }
}

debugTelegram();
