import { db } from "@/lib/db";

export interface TrackingScripts {
    header: string;
    body: string;
    footer: string;
}

export async function getTrackingScripts(): Promise<TrackingScripts> {
    try {
        const settings = await db.systemSetting.findMany({
            where: {
                key: {
                    in: ['SCRIPT_HEADER', 'SCRIPT_BODY', 'SCRIPT_FOOTER']
                }
            }
        });

        const scriptMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, string>);

        return {
            header: scriptMap['SCRIPT_HEADER'] || '',
            body: scriptMap['SCRIPT_BODY'] || '',
            footer: scriptMap['SCRIPT_FOOTER'] || ''
        };
    } catch (error) {
        console.error('Failed to fetch tracking scripts', error);
        return { header: '', body: '', footer: '' };
    }
}
