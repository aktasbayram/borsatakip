"use client";

import { useEffect } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";

export function AlertChecker() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { status } = useSession();

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (status !== "authenticated") return;

        const checkAlerts = async () => {
            try {
                const response = await axios.post("/api/alerts/check");
                const triggeredAlerts = response.data;

                if (Array.isArray(triggeredAlerts) && triggeredAlerts.length > 0) {
                    triggeredAlerts.forEach((alert: any) => {
                        const currency = alert.market === "US" ? "USD" : "TRY";
                        const formattedPrice = formatCurrency(alert.currentPrice, currency);

                        enqueueSnackbar(
                            `🔔 Alarm: ${alert.symbol} hedefi yakalandı! (${formattedPrice}) - Toplam ${alert.triggerCount}. kez`,
                            {
                                variant: "info",
                                autoHideDuration: 10000,
                                anchorOrigin: {
                                    vertical: 'top',
                                    horizontal: 'right',
                                },
                                action: (key) => (
                                    <button onClick={() => closeSnackbar(key)} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )
                            }
                        );

                        // Show browser notification if allowed
                        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                            // Ensure we are not spamming if multiple alerts trigger at once
                            setTimeout(() => {
                                try {
                                    const notification = new Notification(`🔔 Alarm: ${alert.symbol}`, {
                                        body: `Hedef Fiyat Yakalandı!\nGüncel: ${formattedPrice}\nHedef: ${formatCurrency(alert.target, currency)}`,
                                        icon: '/favicon.ico',
                                        requireInteraction: true,
                                        silent: false // Explicitly enable sound/alert priority
                                        // tag removed to ensuring every trigger shows up during testing
                                    });

                                    notification.onclick = function () {
                                        window.focus();
                                        this.close();
                                    };
                                } catch (e) {
                                    console.error("Notification failed", e);
                                }
                            }, 0);
                        }
                    });
                }
            } catch (error) {
                console.error("Alert check failed", error);
            }
        };

        // Check Immediately on mount
        checkAlerts();

        // Then check every 30 seconds
        const intervalId = setInterval(checkAlerts, 30000);

        return () => clearInterval(intervalId);
    }, [status, enqueueSnackbar]);

    return null;
}
