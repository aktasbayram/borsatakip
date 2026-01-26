
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Send a message via Telegram Bot
 */
export async function sendTelegramMessage(chatId: string, message: string) {
    if (!TELEGRAM_BOT_TOKEN) {
        console.warn('TELEGRAM_BOT_TOKEN is not set.');
        return false;
    }

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });
        return true;
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
        return false;
    }
}

/**
 * Send an email (Placeholder for future implementation)
 */
export async function sendEmail(to: string, subject: string, body: string) {
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}, Body: ${body}`);
    // Implement nodemailer here if needed
    return true;
}
