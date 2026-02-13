
import { prisma } from '@/lib/db';

interface SmsProvider {
    send(to: string, message: string): Promise<boolean>;
    getBalance(): Promise<number>;
}

class NetgsmProvider implements SmsProvider {
    async send(to: string, message: string): Promise<boolean> {
        try {
            // Fetch credentials from DB
            const settings = await prisma.systemSetting.findMany({
                where: {
                    key: { in: ['NETGSM_USER', 'NETGSM_PASSWORD', 'NETGSM_HEADER'] }
                }
            });

            const user = settings.find(s => s.key === 'NETGSM_USER')?.value;
            const password = settings.find(s => s.key === 'NETGSM_PASSWORD')?.value;
            const header = settings.find(s => s.key === 'NETGSM_HEADER')?.value;

            if (!user || !password || !header) {
                console.warn('Netgsm credentials missing in System Settings.');
                // console.log('SMS Simulation:', { to, message });
                return true; // Simulate success if not configured, to avoid breaking flow
            }

            // TODO: Implement actual Netgsm API call here using fetched credentials
            // For now, logging the attempt with credentials (be careful with logs in prod)
            console.log(`Sending SMS via Netgsm (${header}) to ${to}: ${message}`);
            return true;
        } catch (error) {
            console.error('Netgsm SMS send error:', error);
            return false;
        }
    }

    async getBalance(): Promise<number> {
        // Placeholder for balance check
        return 0;
    }
}

export const smsService = new NetgsmProvider();
