"use client";

import React from 'react';
import { SessionProvider } from "next-auth/react";
import { SnackbarProvider, useSnackbar } from 'notistack';
import { ThemeProvider } from "next-themes";

// Custom notification components with close button
const CustomNotification = React.forwardRef<HTMLDivElement, { message: string; variant: 'default' | 'success' | 'error' | 'warning' | 'info'; id: string | number }>(
    ({ message, variant, id }, ref) => {
        const { closeSnackbar } = useSnackbar();

        const variantStyles = {
            default: {
                border: 'border-gray-200/50 dark:border-gray-700/50',
                iconBg: 'bg-blue-500/20',
                iconColor: 'text-blue-600 dark:text-blue-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            },
            success: {
                border: 'border-green-200/50 dark:border-green-700/50',
                iconBg: 'bg-green-500/20',
                iconColor: 'text-green-600 dark:text-green-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            },
            error: {
                border: 'border-red-200/50 dark:border-red-700/50',
                iconBg: 'bg-red-500/20',
                iconColor: 'text-red-600 dark:text-red-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            },
            warning: {
                border: 'border-amber-200/50 dark:border-amber-700/50',
                iconBg: 'bg-amber-500/20',
                iconColor: 'text-amber-600 dark:text-amber-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            },
            info: {
                border: 'border-blue-200/50 dark:border-blue-700/50',
                iconBg: 'bg-blue-500/20',
                iconColor: 'text-blue-600 dark:text-blue-400',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            }
        };

        const style = variantStyles[variant];

        return (
            <div ref={ref} className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border ${style.border} rounded-xl shadow-2xl px-4 py-3 min-w-[300px] max-w-md`}>
                <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
                        <svg className={`w-5 h-5 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {style.icon}
                        </svg>
                    </div>
                    <div className="flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{message}</p>
                    </div>
                    <button onClick={() => closeSnackbar(id)} className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
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
                        marginTop: '64px'
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
