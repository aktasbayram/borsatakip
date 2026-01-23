
import nodemailer from "nodemailer";

interface SmtpConfig {
    host: string;
    port: number;
    user?: string;
    pass?: string;
    secure?: boolean;
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor(private smtpConfig?: SmtpConfig) {
        if (smtpConfig) {
            this.transporter = nodemailer.createTransport({
                host: smtpConfig.host,
                port: smtpConfig.port,
                secure: smtpConfig.secure ?? true,
                auth: (smtpConfig.user && smtpConfig.pass) ? {
                    user: smtpConfig.user,
                    pass: smtpConfig.pass,
                } : undefined,
            });
        }
    }

    /**
     * Send an email using the configured transporter or a temporary one
     */
    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            if (!this.transporter) {
                console.warn("EmailService: No SMTP configuration provided.");
                return false;
            }

            const info = await this.transporter.sendMail({
                from: `"Borsa Takip" <${this.smtpConfig?.user || "noreply@borsatakip.com"}>`,
                to: options.to,
                subject: options.subject,
                text: options.text || options.html.replace(/<[^>]*>?/gm, ''), // Simple strip tags for text fallback
                html: options.html,
            });

            console.log(`Email sent: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error("EmailService Error:", error);
            return false;
        }
    }

    /**
     * Static helper to send email with a specific config on the fly
     */
    static async sendWithConfig(config: SmtpConfig, options: EmailOptions): Promise<boolean> {
        const service = new EmailService(config);
        return service.sendEmail(options);
    }
}
