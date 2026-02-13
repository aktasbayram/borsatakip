"use client";

import React from 'react';
import { SessionProvider } from "next-auth/react";
import { SnackbarProvider, useSnackbar } from 'notistack';
import { ThemeProvider } from "next-themes";

// Custom notification components with close button
// Custom notification components with close button
const CustomNotification = React.forwardRef<HTMLDivElement, { message: string; variant: 'default' | 'success' | 'error' | 'warning' | 'info'; id: string | number; action?: React.ReactNode | ((key: any) => React.ReactNode) }>(
    ({ message, variant, id, action }, ref) => {
        const { closeSnackbar } = useSnackbar();

        const variantStyles = {
            default: {
                bg: 'bg-white/90 dark:bg-gray-900/90',
                border: 'border-white/20 dark:border-gray-800/50',
                accent: 'bg-blue-500',
                text: 'text-gray-900 dark:text-gray-100',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            },
            success: {
                bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
                border: 'border-emerald-200/50 dark:border-emerald-800/30',
                accent: 'bg-emerald-500',
                text: 'text-emerald-900 dark:text-emerald-50',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            },
            error: {
                bg: 'bg-rose-50/90 dark:bg-rose-950/40',
                border: 'border-rose-200/50 dark:border-rose-800/30',
                accent: 'bg-rose-500',
                text: 'text-rose-900 dark:text-rose-50',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            },
            warning: {
                bg: 'bg-amber-50/90 dark:bg-amber-950/40',
                border: 'border-amber-200/50 dark:border-amber-800/30',
                accent: 'bg-amber-500',
                text: 'text-amber-900 dark:text-amber-50',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            },
            info: {
                bg: 'bg-sky-50/90 dark:bg-sky-950/40',
                border: 'border-sky-200/50 dark:border-sky-800/30',
                accent: 'bg-sky-500',
                text: 'text-sky-900 dark:text-sky-50',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            }
        };

        const theme = variantStyles[variant];

        return (
            <div ref={ref} className={`relative overflow-hidden ${theme.bg} backdrop-blur-xl border ${theme.border} rounded-2xl shadow-2xl px-5 py-4 min-w-[340px] max-w-md transform transition-all duration-300 hover:scale-[1.02]`}>
                {/* Accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.accent} opacity-80`} />

                <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${theme.accent} bg-opacity-10 flex items-center justify-center border border-current border-opacity-10`}>
                        <svg className={`w-6 h-6 ${theme.text.split(' ')[0]} opacity-90`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {theme.icon}
                        </svg>
                    </div>

                    <div className="flex-1">
                        <p className={`text-[15px] font-semibold tracking-tight ${theme.text}`}>
                            {message}
                        </p>
                    </div>

                    {action && (
                        <div className="flex-shrink-0">
                            {typeof action === 'function' ? action(id) : action}
                        </div>
                    )}

                    <button
                        onClick={() => closeSnackbar(id)}
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }
);

CustomNotification.displayName = 'CustomNotification';


export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <SnackbarProvider
                    maxSnack={3}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    autoHideDuration={5000}
                    classes={{
                        containerRoot: 'mt-16'
                    }}
                    style={{
                        marginTop: '64px',
                        zIndex: 9999
                    }}
                    Components={{
                        default: CustomNotification,
                        success: (props) => <CustomNotification {...props} variant="success" />,
                        error: (props) => <CustomNotification {...props} variant="error" />,
                        warning: (props) => <CustomNotification {...props} variant="warning" />,
                        info: (props) => <CustomNotification {...props} variant="info" />
                    }}
                >
                    {children}

                </SnackbarProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
