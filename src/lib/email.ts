import nodemailer from 'nodemailer';

import { ConfigService } from "@/services/config";

export class EmailService {
    private static async getTransporter() {
        const host = await ConfigService.get("SMTP_HOST") || 'smtp.gmail.com';
        const port = parseInt(await ConfigService.get("SMTP_PORT") || '587');
        const secure = (await ConfigService.get("SMTP_SECURE")) === 'true';
        const user = await ConfigService.get("SMTP_USER");
        const pass = await ConfigService.get("SMTP_PASS");

        return {
            transporter: nodemailer.createTransport({
                host,
                port,
                secure,
                auth: { user, pass },
            }),
            user
        };
    }

    static async sendAlertEmail(to: string, subject: string, htmlDetails: string) {
        const { transporter, user } = await this.getTransporter();

        if (!user) {
            console.warn("SMTP_USER not set, skipping email");
            return;
        }

        try {
            await transporter.sendMail({
                from: `"Borsa Takip" <${user}>`,
                to,
                subject,
                html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Piyasa Uyarısı</h2>
            ${htmlDetails}
            <hr />
            <p style="font-size: 12px; color: #999;">Bu mail Borsa Takip sisteminden otomatik gönderilmiştir.</p>
          </div>
        `,
            });
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}
