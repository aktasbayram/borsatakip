import { NewsFeed } from '@/components/news/NewsFeed';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Haberler ve Duyurular - Borsa Takip',
    description: 'Borsa İstanbul ve küresel piyasalar hakkında en güncel haberler.',
};

export default function NewsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Haberler ve Duyurular</h1>
            <p className="text-muted-foreground">Piyasalardaki son gelişmeleri ve şirket duyurularını takip edin.</p>

            <NewsFeed />
        </div>
    );
}
