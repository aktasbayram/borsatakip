import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ExternalLink, Calendar, Newspaper, TrendingUp, DollarSign } from 'lucide-react';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    summary?: string;
    source?: string;
}

interface NewsCardProps {
    item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
    // Generate a consistent gradient based on title length or content
    const gradients = [
        'from-blue-600 to-indigo-700',
        'from-emerald-600 to-teal-700',
        'from-violet-600 to-purple-700',
        'from-orange-500 to-red-600',
        'from-cyan-600 to-blue-700',
        'from-slate-700 to-gray-800'
    ];

    // Simple hash to pick a gradient
    const hash = item.title.length % gradients.length;
    const gradient = gradients[hash];

    // Pick an icon based on content
    const getIcon = () => {
        const t = item.title.toLowerCase();
        if (t.includes('dolar') || t.includes('altın') || t.includes('kur')) return <DollarSign className="h-6 w-6 text-white/80" />;
        if (t.includes('borsa') || t.includes('bist')) return <TrendingUp className="h-6 w-6 text-white/80" />;
        return <Newspaper className="h-6 w-6 text-white/80" />;
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden group border-0 ring-1 ring-gray-200 dark:ring-gray-800">
            {/* Visual Header */}
            <div className={`h-32 bg-gradient-to-br ${gradient} p-6 relative`}>
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                    {getIcon()}
                </div>
                <div className="absolute bottom-4 left-6 right-6">
                    <span className="flex items-center gap-2 text-xs font-medium text-white/90 bg-black/20 backdrop-blur-md px-2 py-1 rounded-md w-fit">
                        {item.source || 'Haber'}
                    </span>
                </div>
            </div>

            <CardContent className="p-6 flex-1 flex flex-col pt-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar size={14} />
                    {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: tr })}
                </div>

                <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors mb-3 line-clamp-3">
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                        {item.title}
                    </a>
                </h3>

                {item.summary && (
                    <div
                        className="text-sm text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: item.summary }}
                    />
                )}
            </CardContent>

            <CardFooter className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/20 border-t flex justify-between items-center mt-auto">
                <span className="text-xs text-muted-foreground font-medium">
                    {new Date(item.pubDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                    Haberi Oku <ExternalLink size={14} />
                </a>
            </CardFooter>
        </Card>
    );
}
