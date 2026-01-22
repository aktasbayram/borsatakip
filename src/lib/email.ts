import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export class EmailService {
    static async sendAlertEmail(to: string, subject: string, htmlDetails: string) {
        if (!process.env.SMTP_USER) {
            console.warn("SMTP_USER not set, skipping email");
            return;
        }

        try {
            await transporter.sendMail({
                from: `"Borsa Takip" <${process.env.SMTP_USER}>`,
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
