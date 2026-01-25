import { prisma } from "@/lib/db";

export class ConfigService {
    private static cache: Record<string, string> = {};
    private static lastFetch: number = 0;
    private static CACHE_TTL = 60 * 1000; // 1 minute

    static async get(key: string, sensitive: boolean = false): Promise<string | undefined> {
        // 1. Try to get from database (with simple caching)
        const now = Date.now();
        if (this.cache[key] && now - this.lastFetch < this.CACHE_TTL) {
            return this.cache[key];
        }

        try {
            const setting = await prisma.systemSetting.findUnique({
                where: { key },
            });

            if (setting) {
                this.cache[key] = setting.value;
                return setting.value;
            }
        } catch (error) {
            console.warn(`Failed to fetch setting ${key} from DB`, error);
        }

        // 2. Fallback to process.env
        return process.env[key];
    }

    static async set(key: string, value: string, category: string = "GENERAL", isSecret: boolean = false) {
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value, category, isSecret },
            create: { key, value, category, isSecret },
        });
        this.cache[key] = value;
    }

    static async getAll() {
        return prisma.systemSetting.findMany({
            orderBy: { key: 'asc' }
        });
    }
}
