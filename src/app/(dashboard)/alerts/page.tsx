"use client";

import { useEffect, useState } from "react";
import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { Alert } from "@prisma/client";

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const [permission, setPermission] = useState("granted"); // Default to granted to avoid flash

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = () => {
        Notification.requestPermission().then((perm) => {
            setPermission(perm);
        });
    };

    const fetchAlerts = async () => {
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
    }, []);

    const handleDelete = async (id: string) => {
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
        const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";

        // Optimistic update
        setAlerts(alerts.map(a => a.id === id ? { ...a, status: newStatus } : a));

        try {
            await axios.patch(`/api/alerts/${id}`, { status: newStatus });
            enqueueSnackbar(newStatus === "ACTIVE" ? "Alarm aktifleştirildi" : "Alarm pasifleştirildi", { variant: "success" });
        } catch (error) {
            // Revert on error
            setAlerts(alerts.map(a => a.id === id ? { ...a, status: currentStatus } : a));
            console.error(error);
            enqueueSnackbar("Durum güncellenemedi", { variant: "error" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fiyat Alarmları</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Takip ettiğiniz hisseler belirlediğiniz fiyat seviyelerine geldiğinde bildirim alın.
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    + Yeni Alarm
                </Button>
            </div>

            {/* Browser Permission Warning */}
            {permission === "default" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔔</span>
                        <div>
                            <p className="font-bold">Tarayıcı Bildirimlerini Açın</p>
                            <p className="text-sm opacity-90">Sekme kapalıyken de bildirim almak için izin vermeniz gerekiyor.</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={requestPermission}
                        className="bg-white dark:bg-blue-800 text-blue-600 dark:text-white border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-700"
                    >
                        İzin Ver
                    </Button>
                </div>
            )}

            {permission === "denied" && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl mt-1">🚫</span>
                        <div>
                            <p className="font-bold">Bildirim İzni Engellendi</p>
                            <p className="text-sm opacity-90 mb-2">Bildirimleri açmak için şu adımları izleyin:</p>
                            <ol className="text-sm list-decimal list-inside space-y-1 opacity-90">
                                <li>Tarayıcı adres çubuğundaki <strong>kilit (🔒)</strong> simgesine tıklayın.</li>
                                <li><strong>"İzinler"</strong> veya <strong>"Site Ayarları"</strong>nı açın.</li>
                                <li><strong>"Bildirimler"</strong> seçeneğini bulup <strong>"İzin Ver"</strong> yapın.</li>
                                <li>Sayfayı yenileyin.</li>
                            </ol>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="bg-white dark:bg-red-800 text-red-600 dark:text-white border border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-700 whitespace-nowrap"
                    >
                        Sayfayı Yenile
                    </Button>
                </div>
            )}

            {permission === "granted" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg flex gap-3 text-sm text-blue-800 dark:text-blue-200">
                    <span className="text-lg">💡</span>
                    <div>
                        <p className="font-semibold">Bildirim Gelmiyor mu?</p>
                        <p className="opacity-90 mt-1">
                            Bildirim sesi duyuyor ama kutucuk görmüyorsanız, bilgisayarınızın <b>"Rahatsız Etmeyin"</b> veya <b>"Odaklanma Yardımı"</b> (Focus Assist) modu açık olabilir. Windows/Mac bildirim ayarlarından tarayıcınıza izin verdiğinizden emin olun.
                        </p>
                    </div>
                </div>
            )}

            {
                loading ? (
                    <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
                ) : alerts.length === 0 ? (
                    <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Henüz alarmınız yok</h3>
                        <p className="text-gray-500 max-w-sm mt-2 mb-6">
                            Piyasa hareketlerini kaçırmamak için ilk fiyat alarmınızı oluşturun.
                        </p>
                        <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                            Alarm Oluştur
                        </Button>
                    </Card>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {alerts.map((alert) => (
                            <Card key={alert.id} className="p-4 hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                                                {alert.symbol}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                                                {alert.market}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(alert.createdAt).toLocaleDateString("tr-TR")} tarihinde oluşturuldu
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium ${alert.status === 'ACTIVE' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                                {alert.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                                            </span>
                                            <Switch
                                                checked={alert.status === 'ACTIVE'}
                                                onCheckedChange={() => handleToggleStatus(alert.id, alert.status)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleDelete(alert.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                            title="Alarmı Sil"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-full ${alert.type === 'PRICE_ABOVE'
                                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
                                            : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                                            }`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                                    alert.type === 'PRICE_ABOVE'
                                                        ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" // Rising trend
                                                        : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" // Falling trend
                                                } />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {alert.type === 'PRICE_ABOVE' ? 'Yükselirse' : 'Düşerse'}
                                        </span>
                                    </div>
                                    <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                                        {formatCurrency(alert.target, alert.market === 'US' ? 'USD' : 'TRY')}
                                    </span>
                                </div>

                                {(alert as any)._count?.logs > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        <span className="font-medium">
                                            Bugüne kadar {(alert as any)._count.logs} kez tetiklendi
                                        </span>
                                    </div>
                                )}


                            </Card>
                        ))}
                    </div>
                )
            }

            <CreateAlertDialog
                open={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    fetchAlerts(); // Refresh list on close if needed
                }}
            />
        </div >
    );
}

