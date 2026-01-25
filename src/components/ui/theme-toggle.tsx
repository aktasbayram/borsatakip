"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="p-2 rounded-md hover:bg-accent transition-colors">
                <div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
            </button>
        );
    }

    // Determine if we're in a "dark-like" theme (dark, fintech, terminal) or light
    const isDarkMode = theme === 'dark' || theme === 'fintech' || theme === 'terminal';

    const handleToggle = () => {
        // Always toggle between light and dark, regardless of current theme
        setTheme(isDarkMode ? 'light' : 'dark');
    };

    return (
        <button
            onClick={handleToggle}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={isDarkMode ? "Açık Moda Geç" : "Koyu Moda Geç"}
        >
            {isDarkMode ? (
                // Sun Icon (for dark modes)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                // Moon Icon (for light mode)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
}
