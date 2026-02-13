import { db } from "@/lib/db";

export interface TrackingScripts {
    header: string;
    body: string;
    footer: string;
}

export interface SystemSettings {
    siteName: string;
    siteLogoUrl: string;
    defaultLanguage: string;
    seoTitle: string;
    seoKeywords: string;
    seoDescription: string;
    socialX: string;
    socialInstagram: string;
    socialFacebook: string;
    socialLinkedin: string;
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

export async function getSystemSettings(): Promise<SystemSettings> {
    try {
        const keys = [
            'SITE_NAME', 'SITE_LOGO_URL', 'DEFAULT_LANGUAGE',
            'SEO_TITLE', 'SEO_KEYWORDS', 'SEO_DESCRIPTION',
            'SOCIAL_X', 'SOCIAL_INSTAGRAM', 'SOCIAL_FACEBOOK', 'SOCIAL_LINKEDIN'
        ];

        const settings = await db.systemSetting.findMany({
            where: { key: { in: keys } }
        });

        const map = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {} as Record<string, string>);

        return {
            siteName: map['SITE_NAME'] || 'e-borsa',
            siteLogoUrl: map['SITE_LOGO_URL'] || '',
            defaultLanguage: map['DEFAULT_LANGUAGE'] || 'tr',
            seoTitle: map['SEO_TITLE'] || '',
            seoKeywords: map['SEO_KEYWORDS'] || '',
            seoDescription: map['SEO_DESCRIPTION'] || '',
            socialX: map['SOCIAL_X'] || '',
            socialInstagram: map['SOCIAL_INSTAGRAM'] || '',
            socialFacebook: map['SOCIAL_FACEBOOK'] || '',
            socialLinkedin: map['SOCIAL_LINKEDIN'] || ''
        };
    } catch (error) {
        console.error('Failed to fetch system settings', error);
        return {
            siteName: 'e-borsa',
            siteLogoUrl: '',
            defaultLanguage: 'tr',
            seoTitle: '',
            seoKeywords: '',
            seoDescription: '',
            socialX: '',
            socialInstagram: '',
            socialFacebook: '',
            socialLinkedin: ''
        };
    }
}
