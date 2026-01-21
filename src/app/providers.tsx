"use client";

import { SessionProvider } from "next-auth/react";
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from "next-themes";
import { AlertChecker } from "@/components/providers/AlertChecker";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <SnackbarProvider maxSnack={3}>
                    {children}
                    <AlertChecker />
                </SnackbarProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
