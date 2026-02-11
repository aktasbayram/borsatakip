"use client";

import { useTheme } from "next-themes";
import { useLayoutWidth } from "@/hooks/useLayoutWidth";
import { useDashboardPreferences } from "@/hooks/useDashboardPreferences";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Switch } from "@/components/ui/switch";

interface ThemeSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

function PreferencesToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

interface ThemeSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

export function ThemeSettingsDialog({ open, onClose }: ThemeSettingsDialogProps) {
    const { theme, setTheme } = useTheme();
    const { layoutWidth, setLayoutWidth } = useLayoutWidth();
    const { preferences, updatePreference } = useDashboardPreferences();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    if (!mounted) return null;
    if (!open) return null;

    // Use portal to render outside the DOM hierarchy (optional but good practice)
    // For simplicity here, we'll render strictly if open.

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tema Ayarları</h2>
                        <p className="text-sm text-center text-gray-500 mt-1">Görünüm tercihinizi seçin</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Light Mode */}
                    <div
                        className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "light"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                            }`}
                        onClick={() => { setTheme("light"); onClose(); }}
                    >
                        <div className="w-full aspect-video rounded-lg bg-[#f3f4f6] border border-gray-200 p-2 flex gap-2 pointer-events-none">
                            <div className="w-1/3 h-full bg-white rounded shadow-sm"></div>
                            <div className="w-2/3 h-full flex flex-col gap-2">
                                <div className="w-full h-8 bg-white rounded shadow-sm"></div>
                                <div className="w-full h-full bg-white rounded shadow-sm"></div>
                            </div>
                        </div>
                        <span className={`font-medium text-sm ${theme === "light" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>Aydınlık</span>
                    </div>

                    {/* Dark Mode */}
                    <div
                        className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "dark"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                            }`}
                        onClick={() => { setTheme("dark"); onClose(); }}
                    >
                        <div className="w-full aspect-video rounded-lg bg-[#111827] border border-gray-700 p-2 flex gap-2 pointer-events-none">
                            <div className="w-1/3 h-full bg-[#1f2937] rounded shadow-sm border border-gray-600"></div>
                            <div className="w-2/3 h-full flex flex-col gap-2">
                                <div className="w-full h-8 bg-[#1f2937] rounded shadow-sm border border-gray-600"></div>
                                <div className="w-full h-full bg-[#1f2937] rounded shadow-sm border border-gray-600"></div>
                            </div>
                        </div>
                        <span className={`font-medium text-sm ${theme === "dark" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>Karanlık</span>
                    </div>

                    {/* System Mode */}
                    <div
                        className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "system"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                            }`}
                        onClick={() => { setTheme("system"); onClose(); }}
                    >
                        <div className="w-full aspect-video rounded-lg bg-gradient-to-r from-[#f3f4f6] to-[#111827] border border-gray-200 dark:border-gray-700 p-2 flex gap-2 relative overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/20 to-transparent transform -skew-x-12"></div>
                        </div>
                        <span className={`font-medium text-sm ${theme === "system" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>Sistem</span>
                    </div>

                    {/* Minimal Theme */}
                    <div
                        className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "minimal"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                            }`}
                        onClick={() => { setTheme("minimal"); onClose(); }}
                    >
                        <div className="w-full aspect-video rounded-lg bg-white border border-gray-200 p-2 flex gap-2 pointer-events-none">
                            <div className="w-1/3 h-full bg-gray-50 rounded-sm border border-dashed border-gray-300"></div>
                            <div className="w-2/3 h-full flex flex-col gap-2">
                                <div className="w-full h-8 bg-gray-50 rounded-sm border border-dashed border-gray-300"></div>
                                <div className="w-full h-full bg-gray-50 rounded-sm border border-dashed border-gray-300"></div>
                            </div>
                        </div>
                        <span className={`font-medium text-sm ${theme === "minimal" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>Minimal (Açık)</span>
                    </div>

                    {/* Fintech Theme */}
                    <div
                        className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "fintech"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                            }`}
                        onClick={() => { setTheme("fintech"); onClose(); }}
                    >
                        <div className="w-full aspect-video rounded-lg bg-[#1e1b4b] border border-indigo-900 p-2 flex gap-2 pointer-events-none">
                            <div className="w-1/3 h-full bg-[#312e81] rounded shadow-sm border border-indigo-800"></div>
                            <div className="w-2/3 h-full flex flex-col gap-2">
                                <div className="w-full h-8 bg-[#312e81] rounded shadow-sm border border-indigo-800"></div>
                                <div className="w-full h-full bg-[#312e81] rounded shadow-sm border border-indigo-800"></div>
                            </div>
                        </div>
                        <span className={`font-medium text-sm ${theme === "fintech" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>Fintech</span>
                    </div>

                    {/* Terminal Theme */}
                    <div
                        className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "terminal"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                            }`}
                        onClick={() => { setTheme("terminal"); onClose(); }}
                    >
                        <div className="w-full aspect-video rounded-lg bg-black border border-green-900 p-2 flex gap-2 pointer-events-none font-mono">
                            <div className="w-1/3 h-full bg-black rounded shadow-sm border border-green-800"></div>
                            <div className="w-2/3 h-full flex flex-col gap-2">
                                <div className="w-full h-8 bg-black rounded shadow-sm border border-green-800"></div>
                                <div className="w-full h-full bg-black rounded shadow-sm border border-green-800"></div>
                            </div>
                        </div>
                        <span className={`font-medium text-sm ${theme === "terminal" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>Terminal</span>
                    </div>

                    {/* Sharp Light Theme */}
                    <div
                        className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "sharp"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                            }`}
                        onClick={() => { setTheme("sharp"); onClose(); }}
                    >
                        <div className="w-full aspect-video rounded-none bg-white border border-gray-400 p-2 flex gap-2 pointer-events-none">
                            <div className="w-1/3 h-full bg-gray-100 rounded-none border border-gray-300"></div>
                            <div className="w-2/3 h-full flex flex-col gap-2">
                                <div className="w-full h-8 bg-gray-100 rounded-none border border-gray-300"></div>
                                <div className="w-full h-full bg-gray-100 rounded-none border border-gray-300"></div>
                            </div>
                        </div>
                        <span className={`font-medium text-sm ${theme === "sharp" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>Keskin (Açık)</span>
                    </div>

                    {/* Sharp Dark Theme */}
                    <div
                        className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "sharp-dark"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                            }`}
                        onClick={() => { setTheme("sharp-dark"); onClose(); }}
                    >
                        <div className="w-full aspect-video rounded-none bg-[#020617] border border-gray-700 p-2 flex gap-2 pointer-events-none">
                            <div className="w-1/3 h-full bg-[#1e293b] rounded-none border border-gray-600"></div>
                            <div className="w-2/3 h-full flex flex-col gap-2">
                                <div className="w-full h-8 bg-[#1e293b] rounded-none border border-gray-600"></div>
                                <div className="w-full h-full bg-[#1e293b] rounded-none border border-gray-600"></div>
                            </div>
                        </div>
                        <span className={`font-medium text-sm ${theme === "sharp-dark" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>Keskin (Koyu)</span>
                    </div>

                    {/* Emerald Theme */}
                    <div
                        className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "emerald"
                            ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/10 shadow-md"
                            : "border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                            }`}
                        onClick={() => { setTheme("emerald"); onClose(); }}
                    >
                        <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-[#020617] to-[#064e3b] border border-emerald-500/30 p-2 flex gap-2 pointer-events-none">
                            <div className="w-1/3 h-full bg-[#064e3b]/80 rounded-md border border-emerald-500/20 shadow-lg"></div>
                            <div className="w-2/3 h-full flex flex-col gap-2">
                                <div className="w-full h-8 bg-emerald-500/20 rounded-md border border-emerald-500/30"></div>
                                <div className="w-full h-full bg-[#064e3b]/80 rounded-md border border-emerald-500/20"></div>
                            </div>
                        </div>
                        <span className={`font-medium text-sm ${theme === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400"}`}>Emerald (Yeşil)</span>
                    </div>


                </div>

                {/* Layout Width Section */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Layout Genişliği</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {/* Compact Width */}
                        <div
                            className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${layoutWidth === 'compact'
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md'
                                : 'border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                                }`}
                            onClick={() => {
                                setLayoutWidth('compact');
                            }}
                        >
                            <div className="w-full aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center pointer-events-none">
                                <div className="w-3/4 h-3/4 bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="text-center">
                                <span className={`font-medium text-sm block ${layoutWidth === 'compact' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    Kompakt
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">1280px</span>
                            </div>
                        </div>

                        {/* Wide Width */}
                        <div
                            className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${layoutWidth === 'wide'
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md'
                                : 'border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                                }`}
                            onClick={() => {
                                setLayoutWidth('wide');
                            }}
                        >
                            <div className="w-full aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center pointer-events-none">
                                <div className="w-full h-3/4 bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="text-center">
                                <span className={`font-medium text-sm block ${layoutWidth === 'wide' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    Değişik
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">1000px</span>
                            </div>
                        </div>

                        {/* Automatic Width */}
                        <div
                            className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${layoutWidth === 'auto'
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md'
                                : 'border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
                                }`}
                            onClick={() => {
                                setLayoutWidth('auto');
                            }}
                        >
                            <div className="w-full aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center pointer-events-none">
                                <div className="w-full h-full bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center">
                                <span className={`font-medium text-sm block ${layoutWidth === 'auto' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    Otomatik
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">Tam Ekran</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Widgets Section */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dashboard Bileşenleri</h3>

                    <div className="space-y-3">
                        <PreferencesToggle
                            label="Piyasa Endeksleri (BIST, Altın, Döviz)"
                            checked={preferences.showIndices}
                            onChange={(checked) => updatePreference('showIndices', checked)}
                        />
                        <PreferencesToggle
                            label="Halka Arzlar (Yaklaşan Arzlar)"
                            checked={preferences.showIpo}
                            onChange={(checked) => updatePreference('showIpo', checked)}
                        />
                        <PreferencesToggle
                            label="Finansal Takvim & Ajanda"
                            checked={preferences.showAgenda}
                            onChange={(checked) => updatePreference('showAgenda', checked)}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
