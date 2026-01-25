"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    // Monitor theme changes and clean up old classes
    React.useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const html = document.documentElement;
                    const classes = html.className.split(' ');
                    const themeClasses = ['light', 'dark', 'fintech', 'terminal'];

                    // Find which theme classes are present
                    const presentThemes = classes.filter(c => themeClasses.includes(c));

                    // If multiple theme classes exist, keep only the last one (most recent)
                    if (presentThemes.length > 1) {
                        const latestTheme = presentThemes[presentThemes.length - 1];
                        const otherThemes = themeClasses.filter(t => t !== latestTheme);

                        // Remove old theme classes
                        html.classList.remove(...otherThemes);
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
