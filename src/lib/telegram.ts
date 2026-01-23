import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export class TelegramService {
  /**
   * Send a text message to a chat ID
   */
  static async sendMessage(chatId: string, text: string) {
    if (!TELEGRAM_BOT_TOKEN) {
      console.warn('TELEGRAM_BOT_TOKEN is not set');
      // In development we might want to throw or log only
      return;
    }

    try {
      await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }

  /**
   * Get updates (useful for polling in a script)
   */
  static async getUpdates(offset?: number) {
    if (!TELEGRAM_BOT_TOKEN) return [];
    try {
      const res = await axios.get(`${TELEGRAM_API_URL}/getUpdates`, {
        params: { offset, timeout: 5 }
      });
      return res.data.result;
    } catch (error) {
      console.error("Error getting updates", error);
      return [];
    }
  }
}
