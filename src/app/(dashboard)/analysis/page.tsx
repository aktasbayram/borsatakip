
import AiAnalysisFeed from '@/components/AiAnalysisFeed';

export default function AnalysisPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Piyasa Analiz Merkezi</h1>
                <p className="text-muted-foreground">
                    Yapay zeka gücüyle piyasa haberlerinin anlık analizi ve duygu durumu.
                </p>
            </div>

            <AiAnalysisFeed />
        </div>
    );
}
