"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ThemeSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

export function ThemeSettingsDialog({ open, onClose }: ThemeSettingsDialogProps) {
    const { theme, setTheme } = useTheme();
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
