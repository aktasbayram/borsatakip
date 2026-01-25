import axios from 'axios';

import { ConfigService } from "@/services/config";

const getTelegramConfig = async () => {
  const token = await ConfigService.get("TELEGRAM_BOT_TOKEN");
  return {
    token,
    url: `https://api.telegram.org/bot${token}`
  }
}

export class TelegramService {
  /**
   * Send a text message to a chat ID
   */
  static async sendMessage(chatId: string, text: string) {
    const { token, url } = await getTelegramConfig();
    if (!token) {
      console.warn('TELEGRAM_BOT_TOKEN is not set');
      return;
    }

    try {
      await axios.post(`${url}/sendMessage`, {
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
    const { token, url } = await getTelegramConfig();
    if (!token) return [];
    try {
      const res = await axios.get(`${url}/getUpdates`, {
        params: { offset, timeout: 5 }
      });
      return res.data.result;
    } catch (error) {
      console.error("Error getting updates", error);
      return [];
    }
  }
}
