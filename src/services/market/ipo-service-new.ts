    /**
     * Get active IPOs purely from the database.
     * The database is populated by the `syncIpos` bot.
     */
    static async getActiveIpos(): Promise < IpoItem[] > {
    const getCached = unstable_cache(
        async () => {
            let allIpos: any[] = [];
            try {
                // @ts-ignore
                if (db.ipo) {
                    // @ts-ignore
                    allIpos = await db.ipo.findMany({
                        orderBy: { createdAt: 'desc' } // Or by date?
                    });
                }
            } catch (error) {
                console.error('Failed to fetch IPOs from DB:', error);
                return [];
            }

            const mapped: IpoItem[] = allIpos.map((ipo: any) => ({
                code: ipo.code,
                company: ipo.company,
                date: ipo.date || '-',
                price: ipo.price || '-',
                lotCount: ipo.lotCount || '-',
                market: ipo.market || '-',
                url: ipo.url || '',
                imageUrl: ipo.imageUrl || '',
                distributionMethod: ipo.distributionMethod || '-',
                isNew: ipo.isNew,
                statusText: ipo.statusText || undefined,
                status: ipo.status === 'DRAFT' ? 'Draft' :
                    (ipo.status === 'ACTIVE' ? 'Active' : 'New'),
                showOnHomepage: ipo.showOnHomepage
            }));

            // Sort: Homepage items first, then by potential importance (New/Talep)
            mapped.sort((a, b) => {
                // 1. Show on Homepage
                if (a.showOnHomepage !== b.showOnHomepage) {
                    return (b.showOnHomepage ? 1 : 0) - (a.showOnHomepage ? 1 : 0);
                }

                // 2. Talep Toplanıyor / Active
                const isTalepA = a.statusText === 'TALEP TOPLANIYOR' || a.status === 'Active';
                const isTalepB = b.statusText === 'TALEP TOPLANIYOR' || b.status === 'Active';
                if (isTalepA !== isTalepB) return isTalepB ? 1 : -1;

                // 3. New
                return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
            });

            return mapped;
        },
        ['active-ipos-db-only-v1'], // New cache key
        { revalidate: 3600, tags: ['ipos'] }
    );

    return getCached();
}
