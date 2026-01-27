import { IpoService } from "@/services/market/ipo-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Building2, Calendar, Coins, ExternalLink, FileText, PieChart, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function IpoDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const detail = await IpoService.getIpoDetail(slug);

    if (!detail) {
        notFound();
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{detail.company}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{detail.code}</Badge>
                        <span className="text-sm">• {detail.market}</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Key Stats & Image */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                            {detail.imageUrl ? (
                                <img src={detail.imageUrl} alt={detail.company} className="h-32 object-contain rounded-lg bg-white p-2 border" />
                            ) : (
                                <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-12 h-12 text-muted-foreground" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fiyat</div>
                                    <div className="font-bold text-lg text-primary">{detail.price}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lot Sayısı</div>
                                    <div className="font-bold text-lg text-foreground">{detail.lotCount}</div>
                                </div>
                            </div>


                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Talep Toplama Tarihi</div>
                                    <div className="font-semibold">{detail.date}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Coins className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Arz Büyüklüğü</div>
                                    <div className="font-semibold">{detail.size || '-'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Aracı Kurum</div>
                                    <div className="font-semibold line-clamp-1" title={detail.leadUnderwriter}>{detail.leadUnderwriter || '-'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Info className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Dağıtım Yöntemi</div>
                                    <div className="font-semibold">{detail.distributionMethod}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Bist İlk İşlem Tarihi</div>
                                    <div className="font-semibold">{detail.firstTradingDate}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Detailed Info Sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Render all generic summary sections scraped from "Özet Bilgiler" */}
                    {detail.summaryInfo && detail.summaryInfo.map((section, idx) => {
                        // Skip table sections specifically
                        if (section.title === 'Finansal Tablo' && section.items.some(i => i.includes('Hasılat'))) {
                            return (
                                <Card key={idx}>
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                        <TrendingUpIcon className="w-5 h-5 text-primary" />
                                        <h3 className="font-bold">{section.title}</h3>
                                    </div>
                                    <CardContent className="p-4">
                                        <ul className="space-y-2">
                                            {section.items.map((item, i) => (
                                                <li key={i} className="text-sm border-b border-gray-50 dark:border-gray-800/50 last:border-0 pb-2 last:pb-0">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )
                        }

                        // Skip 'Halka Arz Büyüklüğü' as it is shown in the left column
                        if (section.title.includes('Halka Arz Büyüklüğü')) return null;

                        // Determine icon based on title keywords
                        let Icon: React.ElementType = FileText;
                        if (section.title.includes('Fon')) Icon = PieChart;
                        else if (section.title.includes('Tahsisat')) Icon = UsersIcon;
                        else if (section.title.includes('Satmama')) Icon = FileText;
                        else if (section.title.includes('Fiyat İstikrarı')) Icon = TrendingUpIcon;
                        else if (section.title.includes('Halka Arz Şekli')) Icon = Info;

                        return (
                            <Card key={idx}>
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                    <Icon className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold">{section.title}</h3>
                                </div>
                                <CardContent className="p-4">
                                    <ul className="space-y-2">
                                        {section.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Icon Components Helper
function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

function TrendingUpIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    )
}
