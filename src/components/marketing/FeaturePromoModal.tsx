
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FeaturePromoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAction: () => void;
    feature: 'AI_ANALYSIS' | 'ALERTS' | 'PORTFOLIO';
}

export function FeaturePromoModal({ isOpen, onClose, onAction, feature }: FeaturePromoModalProps) {
    const getContent = () => {
        switch (feature) {
            case 'AI_ANALYSIS':
                return {
                    title: "Yapay Zeka ile Piyasanın Önünde Olun 🤖",
                    description: "BorsaTakip'in gelişmiş yapay zeka modelleri ile hisselerin geleceğini tahmin edin. Artık karanlıkta yolunuzu aramayın.",
                    items: [
                        { icon: "📈", title: "Fiyat Tahminleri", desc: "Hissenin kısa ve orta vadeli yönünü öğrenin." },
                        { icon: "🧠", title: "Derinlemesine Analiz", desc: "Teknik indikatörlerin karmaşık sinyallerini anlaşılır yorumlara çevirin." },
                        { icon: "📰", title: "Haber Analizi", desc: "Piyasa haberlerinin hisse üzerindeki olası etkilerini anında görün." },
                        { icon: "⚡", title: "AL/SAT Sinyalleri", desc: "Yapay zekanın belirlediği kritik seviyelerden haberdar olun." },
                    ],
                    buttonText: "Ücretsiz Hesap Oluştur ve Dene"
                };
            case 'ALERTS':
                return {
                    title: "Fırsatları Bir Daha Asla Kaçırmayın 🔔",
                    description: "Siz ekran başında değilken bile piyasayı 7/24 izleyen akıllı alarmlar kurun.",
                    items: [
                        { icon: "🎯", title: "Fiyat Alarmları", desc: "İstediğiniz fiyata geldiğinde anında bildirim alın." },
                        { icon: "📱", title: "Telegram & Web Bildirimleri", desc: "Bildirimler cebinize anında gelsin." },
                        { icon: "📊", title: "Sınırsız Takip", desc: "Dilediğiniz kadar hisseyi aynı anda takip edin." },
                    ],
                    buttonText: "Hemen Alarm Oluştur"
                };
            default:
                return {
                    title: "Bu Özelliği Keşfedin",
                    description: "Bu özelliği kullanmak için lütfen giriş yapın.",
                    items: [],
                    buttonText: "Giriş Yap / Kayıt Ol"
                };
        }
    };

    const content = getContent();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center">
                    <div className="text-4xl mb-4 opacity-90">✨</div>
                    <DialogTitle className="text-2xl font-bold mb-2 text-white">
                        {content.title}
                    </DialogTitle>
                    <DialogDescription className="text-blue-100 text-base">
                        {content.description}
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {content.items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                <span className="text-2xl shadow-sm bg-white dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center">
                                    {item.icon}
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={() => {
                            onClose();
                            onAction();
                        }}
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/20"
                    >
                        {content.buttonText}
                    </Button>

                    <p className="text-center text-xs text-gray-400">
                        Zaten hesabınız var mı? <button onClick={() => { onClose(); onAction(); }} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Giriş Yapın</button>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
