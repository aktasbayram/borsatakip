"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppearancePage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        router.push("/");
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/settings"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tema Ayarları</h1>
                    <p className="text-sm text-gray-500">Uygulama temasını tercihinize göre özelleştirin.</p>
                </div>
            </div>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Tema Seçimi</CardTitle>
                    <CardDescription>
                        Uygulamanın aydınlık veya karanlık modunu seçin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {/* Light Mode */}
                        <div
                            className={`cursor-pointer group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === "light"
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                                }`}
                            onClick={() => handleThemeChange("light")}
                        >
                            <div className="w-full aspect-video rounded-lg bg-[#f3f4f6] border border-gray-200 p-2 flex gap-2">
                                <div className="w-1/3 h-full bg-white rounded shadow-sm"></div>
                                <div className="w-2/3 h-full flex flex-col gap-2">
                                    <div className="w-full h-8 bg-white rounded shadow-sm"></div>
                                    <div className="w-full h-full bg-white rounded shadow-sm"></div>
                                </div>
                            </div>
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Aydınlık</span>
                        </div>

                        {/* Dark Mode */}
                        <div
                            className={`cursor-pointer group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === "dark"
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                                }`}
                            onClick={() => handleThemeChange("dark")}
                        >
                            <div className="w-full aspect-video rounded-lg bg-[#111827] border border-gray-700 p-2 flex gap-2">
                                <div className="w-1/3 h-full bg-[#1f2937] rounded shadow-sm border border-gray-600"></div>
                                <div className="w-2/3 h-full flex flex-col gap-2">
                                    <div className="w-full h-8 bg-[#1f2937] rounded shadow-sm border border-gray-600"></div>
                                    <div className="w-full h-full bg-[#1f2937] rounded shadow-sm border border-gray-600"></div>
                                </div>
                            </div>
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Karanlık</span>
                        </div>

                        {/* System Mode */}
                        <div
                            className={`cursor-pointer group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === "system"
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                                }`}
                            onClick={() => handleThemeChange("system")}
                        >
                            <div className="w-full aspect-video rounded-lg bg-gradient-to-r from-[#f3f4f6] to-[#111827] border border-gray-200 dark:border-gray-700 p-2 flex gap-2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/20 to-transparent transform -skew-x-12"></div>
                            </div>
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Sistem</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
