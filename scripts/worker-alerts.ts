import { PrismaClient } from '@prisma/client';
import { MarketService } from '../src/services/market'; // Assuming absolute import works or use relative
// If ts-node/tsx has issues with aliases, we use relative paths.
// But we are in scripts/, so ../src/...

// Fix: We need to ensure we can import from src in scripts execution context.
// tsx handles tsconfig paths usually, but let's be safe.

const prisma = new PrismaClient();

async function checkAlerts() {
    console.log('Checking alerts...', new Date().toISOString());

    try {
        const activeAlerts = await prisma.alert.findMany({
            where: { status: 'ACTIVE' },
            include: { user: true }
        });

        if (activeAlerts.length === 0) {
            console.log('No active alerts.');
            return;
        }

        console.log(`Processing ${activeAlerts.length} active alerts.`);

        for (const alert of activeAlerts) {
            try {
                const quote = await MarketService.getQuote(alert.symbol, alert.market as 'BIST' | 'US');
                if (!quote) continue;

                let triggered = false;
                let message = '';

                if (alert.type === 'PRICE_ABOVE' && quote.price >= alert.target) {
                    triggered = true;
                    message = `${alert.symbol} fiyatı ${alert.target} seviyesinin üzerine çıktı. Güncel: ${quote.price}`;
                } else if (alert.type === 'PRICE_BELOW' && quote.price <= alert.target) {
                    triggered = true;
                    message = `${alert.symbol} fiyatı ${alert.target} seviyesinin altına düştü. Güncel: ${quote.price}`;
                }

                // Logic for PERCENT_CHANGE can be added (requires reference price, usually daily change or from alert creation)

                if (triggered) {
                    console.log(`ALERT TRIGGERED: ${message}`);

                    // Update Alert Status
                    await prisma.alert.update({
                        where: { id: alert.id },
                        data: { status: 'TRIGGERED' }
                    });

                    // Create Log
                    await prisma.alertLog.create({
                        data: {
                            alertId: alert.id,
                            message: message,
                        }
                    });

                    // Send Email (Mock)
                    console.log(`[EMAIL SENT] To: ${alert.user.email} Subject: ALARM: ${alert.symbol} Body: ${message}`);
                }

            } catch (err) {
                console.error(`Error processing alert ${alert.id}:`, err);
            }
        }

    } catch (error) {
        console.error('Worker error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run immediately then schedule
checkAlerts().then(() => {
    // setInterval(checkAlerts, 60000); // Uncomment for continuous run
    // For script execution, we just run once.
});
