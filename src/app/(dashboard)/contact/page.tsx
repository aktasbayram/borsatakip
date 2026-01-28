'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSnackbar } from "notistack";
import axios from "axios";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<Record<string, string>>({});
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        // Fetch contact settings
        axios.get("/api/settings/contact")
            .then(res => setConfig(res.data))
            .catch(err => console.error("Contact settings error", err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post("/api/contact", formData);
            enqueueSnackbar("Mesajınız başarıyla gönderildi", { variant: "success" });
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || "Mesaj gönderilemedi";
            enqueueSnackbar(msg, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    İletişime Geçin
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Sorularınız, önerileriniz veya destek için bize ulaşın.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Form */}
                <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Mesaj Gönderin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Adınız Soyadınız</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Ad Soyad"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    minLength={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta Adresiniz</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="ornek@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Konu</Label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    placeholder="Mesajınızın konusu"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Mesajınız</Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Bize iletmek istediğiniz mesaj..."
                                    className="min-h-[150px]"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    minLength={10}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={loading}
                            >
                                {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>İletişim Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {config.CONTACT_ADDRESS && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Adres</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 whitespace-pre-line">
                                            {config.CONTACT_ADDRESS}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {config.CONTACT_PHONE && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">Telefon</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                            {config.CONTACT_PHONE}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {config.CONTACT_EMAIL && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">E-posta</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                            {config.CONTACT_EMAIL}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {config.CONTACT_MAP_URL && (
                        <div className="rounded-xl overflow-hidden shadow-lg h-[300px]">
                            <iframe
                                src={config.CONTACT_MAP_URL}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
