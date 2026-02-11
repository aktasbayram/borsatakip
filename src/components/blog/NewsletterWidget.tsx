"use client";

import React, { useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function NewsletterWidget() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            enqueueSnackbar("Lütfen geçerli bir e-posta adresi girin.", { variant: "warning" });
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/newsletter/subscribe", { email });
            enqueueSnackbar(res.data.message || "Bültenimize başarıyla abone oldunuz! 🎉", { variant: "success" });
            setEmail("");
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Abonelik sırasında bir hata oluştu.";
            enqueueSnackbar(errorMsg, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-primary/[0.03] border-primary/10 rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tight">Bültenimize Katılın</h3>
                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                    Hemen ücretsiz üye olun ve yeni güncellemelerden haberdar olan ilk kişi olun.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-Posta Adresiniz"
                    disabled={loading}
                    className="w-full bg-background border-border/40 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white rounded-xl py-2.5 text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "GÖNDERİLİYOR..." : "ABONE OL"}
                </button>
            </form>
        </Card>
    );
}
