"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";

export function SyncIposButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const handleSync = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/system/sync-ipos", {
                method: "POST",
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || "Sync failed");
            }

            const json = await res.json();

            if (json.success) {
                const { added, updated, errors, logs } = json.data;
                const message = `Senkronizasyon Tamamlandı: +${added}, ~${updated}, !${errors}`;
                enqueueSnackbar(message, {
                    variant: 'success',
                    autoHideDuration: 5000
                });
                router.refresh();
            } else {
                enqueueSnackbar("Senkronizasyon hatası: " + json.error, { variant: 'error' });
            }

        } catch (error: any) {
            enqueueSnackbar("İşlem başarısız: " + error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleSync} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Veriler Çekiliyor..." : "Verileri Senkronize Et"}
        </Button>
    );
}
