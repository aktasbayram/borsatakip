import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const keys = [
            'SITE_NAME', 'SITE_LOGO_URL',
            'SEO_TITLE', 'SEO_DESCRIPTION', 'SEO_KEYWORDS',
            'SOCIAL_X', 'SOCIAL_INSTAGRAM', 'SOCIAL_FACEBOOK', 'SOCIAL_LINKEDIN'
        ];
        const settings = await db.systemSetting.findMany({
            where: { key: { in: keys } }
        });

        const map = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json({
            siteName: map['SITE_NAME'] || 'e-borsa',
            siteLogoUrl: map['SITE_LOGO_URL'] || '',
            seoTitle: map['SEO_TITLE'] || '',
            seoDescription: map['SEO_DESCRIPTION'] || '',
            seoKeywords: map['SEO_KEYWORDS'] || '',
            socialX: map['SOCIAL_X'] || '',
            socialInstagram: map['SOCIAL_INSTAGRAM'] || '',
            socialFacebook: map['SOCIAL_FACEBOOK'] || '',
            socialLinkedin: map['SOCIAL_LINKEDIN'] || '',
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}
