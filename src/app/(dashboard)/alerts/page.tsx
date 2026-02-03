"use client";

import { useEffect, useState } from "react";
import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, cn } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { Alert } from "@prisma/client";
import { useSession } from "next-auth/react";
import { AuthModal } from "@/components/auth/AuthModal";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    Zap,
    Target,
    TrendingUp,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    Info,
    AlertTriangle,
    CheckCircle2,
    Plus,
    Activity,
    Shield,
    History,
    Clock
} from "lucide-react";

const MOCK_ALERTS: Partial<Alert>[] = [
    { id: 'mock-1', symbol: 'THYAO', market: 'BIST', type: 'PRICE_ABOVE', target: 320.50, status: 'ACTIVE', createdAt: new Date() },
    { id: 'mock-2', symbol: 'GARAN', market: 'BIST', type: 'PRICE_BELOW', target: 68.00, status: 'ACTIVE', createdAt: new Date() },
    { id: 'mock-3', symbol: 'AAPL', market: 'US', type: 'PRICE_ABOVE', target: 185.00, status: 'ACTIVE', createdAt: new Date() },
];

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [maxAlerts, setMaxAlerts] = useState(2);
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { status } = useSession();

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

    const [permission, setPermission] = useState("granted");

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }

        if (status === 'authenticated') {
            axios.get("/api/user/credits").then(res => {
                if (res.data.maxAlerts) setMaxAlerts(res.data.maxAlerts);
            }).catch(err => console.error("Limit fetch error", err));
        }

    }, [status]);

    const requestPermission = () => {
        Notification.requestPermission().then((perm) => {
            setPermission(perm);
        });
    };

    const fetchAlerts = async () => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            setAlerts(MOCK_ALERTS);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get("/api/alerts");
            setAlerts(response.data);
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Alarmlar yüklenirken hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [status]);

    const handleGuestAction = (action: string) => {
        setAuthView('REGISTER');
        setIsAuthModalOpen(true);
    };

    const handleCreateClick = () => {
        if (status !== 'authenticated') {
            handleGuestAction('CREATE');
            return;
        }

        if (alerts.length >= maxAlerts) {
            setShowUpgradeModal(true);
            return;
        }
        setIsCreateOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (status !== 'authenticated') {
            handleGuestAction('DELETE');
            return;
        }

        if (!confirm("Bu alarmı silmek istediğinize emin misiniz?")) return;

        try {
            await axios.delete(`/api/alerts/${id}`);
            setAlerts(alerts.filter(a => a.id !== id));
            enqueueSnackbar("Alarm silindi", { variant: "success" });
            router.refresh();
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Alarm silinemedi", { variant: "error" });
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        if (status !== 'authenticated') {
            handleGuestAction('TOGGLE');
            return;
        }

        const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
        setAlerts(alerts.map(a => a.id === id ? { ...a, status: newStatus } : a));

        try {
            await axios.patch(`/api/alerts/${id}`, { status: newStatus });
            enqueueSnackbar(newStatus === "ACTIVE" ? "Alarm aktifleştirildi" : "Alarm pasifleştirildi", { variant: "success" });
        } catch (error) {
            setAlerts(alerts.map(a => a.id === id ? { ...a, status: currentStatus } : a));
            console.error(error);
            enqueueSnackbar("Durum güncellenemedi", { variant: "error" });
        }
    };

    const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
    const triggeredTotal = alerts.reduce((acc, a) => acc + (a._count?.logs || 0), 0);

    if (status === 'loading') {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Veriler yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Redesign */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 lg:p-12 border border-slate-800 shadow-2xl group">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-fuchsia-500/20 transition-colors duration-1000"></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20 shadow-sm">
                            <Zap className="w-3.5 h-3.5 fill-indigo-400" />
                            Akıllı Takip Sistemi
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.1] text-white italic">
                            Fiyat <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 pr-2">Alarmları</span>
                        </h1>
                        <p className="text-slate-400 text-sm lg:text-lg font-medium leading-relaxed max-w-xl">
                            Piyasayı sizin yerinize biz takip edelim. Hedef seviyeleriniz tetiklendiğinde
                            <span className="text-indigo-400 font-bold"> Telegram</span> ve <span className="text-fuchsia-400 font-bold"> Tarayıcı</span> üzerinden anlık bildirim alın.
                        </p>
                    </div>

                    <div className="shrink-0">
                        <Button
                            onClick={handleCreateClick}
                            size="lg"
                            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-50 hover:to-fuchsia-500 text-white font-black rounded-[1.25rem] px-10 h-16 shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0 transition-all text-sm uppercase tracking-[0.1em] group"
                        >
                            <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                            Yeni Alarm Kur
                        </Button>
                    </div>
                </div>
            </div>

            {/* Statistics Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label="Aktif Alarmlar"
                    value={activeCount}
                    icon={<Activity className="w-6 h-6 text-emerald-400" />}
                    color="emerald"
                    description="Şu an takibi yapılan aktif fiyat emirleri"
                />
                <StatsCard
                    label="Tetiklenme"
                    value={triggeredTotal}
                    icon={<History className="w-6 h-6 text-indigo-400" />}
                    color="indigo"
                    subLabel="Toplam"
                    description="Hedefe ulaşıp size bildirim gönderilen alarmlar"
                />
                <StatsCard
                    label="Paket Limiti"
                    value={`${alerts.length}/${maxAlerts}`}
                    icon={<Shield className="w-6 h-6 text-fuchsia-400" />}
                    color="fuchsia"
                    progress={(alerts.length / maxAlerts) * 100}
                    description="Mevcut paketinizdeki alarm kontenjanı"
                />
            </div>

            {/* Guest Banner */}
            {status !== 'authenticated' && (
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-indigo-500/20 rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-xl">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-fuchsia-500/5 blur-[80px] rounded-full"></div>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight italic">Piyasayı 7/24 Kaçırmadan Takip Edin</h3>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-base font-medium leading-relaxed">
                        Kendi alarmlarınızı oluşturarak hisse senetleri hedeflediğiniz fiyata geldiğinde anında haberdar olabilirsiniz. Hemen ücretsiz hesabınızı oluşturun.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            onClick={() => { setAuthView('REGISTER'); setIsAuthModalOpen(true); }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl px-10 h-14"
                        >
                            Hemen Başla
                        </Button>
                        <Button
                            onClick={() => { setAuthView('LOGIN'); setIsAuthModalOpen(true); }}
                            variant="outline"
                            className="border-indigo-500/30 text-indigo-400 hover:bg-slate-800 rounded-2xl px-10 h-14"
                        >
                            Giriş Yap
                        </Button>
                    </div>
                </div>
            )}

            {/* Permission Banners */}
            <div className="space-y-4">
                {status === 'authenticated' && permission === "default" && (
                    <div className="bg-slate-900/40 backdrop-blur-md border border-indigo-500/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-500/40 transition-colors">
                        <div className="flex items-center gap-6 text-center md:text-left">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                <Bell className="w-8 h-8 animate-[bounce_2s_infinite]" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-100 tracking-tight italic">Tarayıcı Bildirimlerini Açın</p>
                                <p className="text-sm text-slate-400 font-medium">Borsa kapalıyken veya sekmeniz altta olsa bile anında haberdar olun.</p>
                            </div>
                        </div>
                        <Button
                            onClick={requestPermission}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            Şimdi İzin Ver
                        </Button>
                    </div>
                )}

                {status === 'authenticated' && permission === "denied" && (
                    <div className="bg-red-500/5 backdrop-blur-md border border-red-500/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-100 tracking-tight">Bildirim İzni Engellendi</p>
                                <p className="text-sm text-slate-400 font-medium">Lütfen tarayıcı adres çubuğundaki kilit simgesine tıklayarak bildirimlere izin verin.</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => window.location.reload()}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl px-8"
                        >
                            Sayfayı Yenile
                        </Button>
                    </div>
                )}
            </div>

            {/* Alerts Grid Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-white italic tracking-tight flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-400" />
                        Takip Listem
                    </h2>
                    {alerts.length > 0 && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                            Toplam {alerts.length} Alarm
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-bold text-sm">Alarmlar Getiriliyor...</p>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="bg-slate-950/40 border-2 border-slate-800/50 border-dashed rounded-[3rem] p-20 flex flex-col items-center justify-center text-center group hover:bg-slate-900/40 transition-colors">
                        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-8 shadow-inner relative group-hover:scale-110 transition-transform duration-500">
                            <Bell className="w-12 h-12 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                            <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 italic">Henüz Bir Alarmınız Yok</h3>
                        <p className="text-slate-500 max-w-sm mb-10 text-base font-medium">
                            Piyasa hareketlerini anlık takip etmek için hemen ilk fiyat alarmınızı oluşturun.
                        </p>
                        <Button onClick={handleCreateClick} className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold px-12 h-14 rounded-2xl shadow-xl shadow-indigo-500/20">
                            Hemen Alarm Oluştur
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {alerts.map((alert) => (
                            <AlertCard
                                key={alert.id}
                                alert={alert}
                                onDelete={() => handleDelete(alert.id)}
                                onToggle={() => handleToggleStatus(alert.id, alert.status)}
                                isGuest={status !== 'authenticated'}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateAlertDialog open={isCreateOpen} onClose={() => { setIsCreateOpen(false); fetchAlerts(); }} />
            <UpgradeModal
                open={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title="Alarm Hakkınız Doldu!"
                description={`Mevcut paketinizle en fazla ${maxAlerts} adet aktif alarm oluşturabilirsiniz. Daha fazla alarm için paketinizi yükseltin.`}
            />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView={authView} />
        </div>
    );
}

function StatsCard({ label, value, icon, color, progress, subLabel, description }: { label: string, value: string | number, icon: React.ReactNode, color: string, progress?: number, subLabel?: string, description?: string }) {
    return (
        <div className="bg-slate-950/40 backdrop-blur-2xl border border-slate-800/80 p-7 rounded-[2rem] group hover:border-slate-700/80 transition-all shadow-xl relative overflow-hidden">
            <div className={cn(
                "absolute -top-10 -right-10 w-24 h-24 blur-3xl rounded-full opacity-5 pointer-events-none transition-opacity group-hover:opacity-15",
                color === 'emerald' ? 'bg-emerald-500' : color === 'indigo' ? 'bg-indigo-500' : 'bg-fuchsia-500'
            )}></div>

            <div className="flex items-start justify-between mb-6">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                    color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-fuchsia-500/10 text-fuchsia-400'
                )}>
                    {icon}
                </div>
                {subLabel && <span className="text-[10px] uppercase tracking-[0.2em] font-black bg-slate-900/80 text-slate-500 px-3 py-1 rounded-lg border border-white/5">{subLabel}</span>}
            </div>

            <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black tracking-tighter text-white">{value}</p>
                </div>
                {description && <p className="text-[11px] text-slate-600 font-medium leading-tight pt-1">{description}</p>}
            </div>

            {progress !== undefined && (
                <div className="mt-6 h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div
                        className={cn("h-full rounded-full transition-all duration-1000", {
                            'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]': color === 'emerald',
                            'bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]': color === 'indigo',
                            'bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.3)]': color === 'fuchsia',
                        })}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}

function AlertCard({ alert, onDelete, onToggle, isGuest }: { alert: any, onDelete: () => void, onToggle: () => void, isGuest: boolean }) {
    const isAbove = alert.type === 'PRICE_ABOVE';
    const isActive = alert.status === 'ACTIVE';

    return (
        <Card className={cn(
            "bg-slate-950/40 backdrop-blur-2xl border-slate-800/80 rounded-[2.5rem] p-7 hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-lg",
            !isActive && "opacity-60 grayscale-[0.3]",
            isGuest && "opacity-75 blur-[0.5px]"
        )}>
            {/* Ambient Background Glow */}
            <div className={cn(
                "absolute -top-12 -right-12 w-32 h-32 blur-[60px] rounded-full opacity-0 pointer-events-none transition-opacity duration-700",
                isAbove ? "bg-emerald-500/10" : "bg-red-500/10",
                isActive ? "group-hover:opacity-100" : ""
            )}></div>

            <div className="flex justify-between items-start relative z-10 mb-8">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                        <span className="font-black text-3xl text-white tracking-tighter uppercase italic">{alert.symbol}</span>
                        <div className={cn(
                            "px-2.5 py-0.5 rounded-lg text-[9px] font-black border uppercase tracking-widest",
                            alert.market === 'BIST' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        )}>
                            {alert.market}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tight">
                            {new Date(alert.createdAt).toLocaleDateString("tr-TR", { day: '2-digit', month: 'short' })} oluşturuldu
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1.5">
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            isActive
                                ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse"
                                : "bg-slate-800 shadow-inner"
                        )}></div>
                        <Switch checked={isActive} onCheckedChange={onToggle} className="scale-90" />
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex items-end justify-between">
                <div className="space-y-3">
                    <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-inner",
                        isAbove
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>
                        {isAbove ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {isAbove ? 'Üst Hedef' : 'Alt Hedef'}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Hedef Fiyat</p>
                        <p className="text-4xl font-black text-white font-mono leading-none tracking-tighter">
                            {formatCurrency(alert.target, alert.market === 'US' ? 'USD' : 'TRY')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={onDelete}
                        className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-[1.25rem] transition-all bg-slate-900 shadow-inner border border-white/5 active:scale-95"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    {alert._count?.logs > 0 && (
                        <div className="px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-50">
                            <Zap className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="text-[10px] font-black">{alert._count.logs}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
