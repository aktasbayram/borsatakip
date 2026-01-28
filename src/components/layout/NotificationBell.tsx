
'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Button } from '@/components/ui/button';
import { useSession } from "next-auth/react";

interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string;
    type: string;
    sendInApp?: boolean;
    sendBrowser?: boolean;
    read: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const lastNotifiedId = useRef<string | null>(null);
    const isDeletingRef = useRef(false);

    const [permission, setPermission] = useState('default');

    // Request browser notification permission on mount
    // Request browser notification permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(res => setPermission(res));
            }
        }
    }, []);

    const requestPermission = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
        }
    };

    const { data: session, status } = useSession();

    // ... (rest of state)

    const fetchNotifications = async (isPoll = false) => {
        try {
            // Guest Logic
            if (status === 'unauthenticated') {
                const res = await axios.get('/api/notifications/guest');
                const guestNotes = res.data;

                // Filter out locally read notifications (from localStorage)
                const readIds = JSON.parse(localStorage.getItem('guest_read_notifications') || '[]');

                const mappedNotes = guestNotes.map((n: any) => ({
                    ...n,
                    read: readIds.includes(n.id),
                    createdAt: new Date().toISOString() // Or use a fixed date if stored
                }));

                setNotifications(mappedNotes);
                setUnreadCount(mappedNotes.filter((n: any) => !n.read).length);
                return;
            }

            // Authenticated Logic
            if (status === 'authenticated') {
                const res = await axios.get('/api/notifications?limit=20');

                // Should ignore this poll result if we are in the middle of a delete operation
                if (isDeletingRef.current) return;

                const newNotifications = res.data.notifications;
                setNotifications(newNotifications);
                setUnreadCount(res.data.unreadCount);

                // ... (toast logic same as before)
            }

        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(true), 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [status]); // Add status dependency

    const markAsRead = async (id?: string) => {
        // Guest Logic
        if (status === 'unauthenticated') {
            const readIds = JSON.parse(localStorage.getItem('guest_read_notifications') || '[]');

            if (id) {
                if (!readIds.includes(id)) {
                    readIds.push(id);
                    localStorage.setItem('guest_read_notifications', JSON.stringify(readIds));
                }
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                // Mark all
                const allIds = notifications.map(n => n.id);
                localStorage.setItem('guest_read_notifications', JSON.stringify(allIds));
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
            return;
        }

        // Authenticated Logic
        try {
            await axios.patch('/api/notifications', { id, markAll: !id });
            // Optimistic update
            if (id) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-500 hover:text-primary transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-semibold text-sm">Bildirimler</h3>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAsRead()}
                                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                        title="Tümünü Okundu İşaretle"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7m-14 0l4 4m6-8l-4 4" />
                                        </svg>
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={async () => {
                                            if (!confirm('Tüm bildirimleri silmek istediğinize emin misiniz?')) return;

                                            // Set flag to prevent polling race conditions
                                            isDeletingRef.current = true;

                                            // Optimistic update immediately
                                            setNotifications([]);
                                            setUnreadCount(0);

                                            try {
                                                await axios.delete('/api/notifications');
                                                enqueueSnackbar('Bildirimler temizlendi', { variant: 'success' });
                                            } catch (e) {
                                                console.error(e);
                                                enqueueSnackbar('Hata oluştu', { variant: 'error' });
                                                // Revert or re-fetch on error
                                                fetchNotifications();
                                            } finally {
                                                // Small delay to ensure server side is consistent before allowing polls again
                                                setTimeout(() => {
                                                    isDeletingRef.current = false;
                                                }, 1000);
                                            }
                                        }}
                                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        title="Tümünü Temizle"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
                                    <span className="text-2xl mb-2">💤</span>
                                    <span className="text-sm">Bildiriminiz yok</span>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`p-3 text-sm transition-colors cursor-pointer rounded-md mb-2 border ${
                                                // Unread Styles (Stronger Background)
                                                !n.read ? (
                                                    n.type === 'SUCCESS' ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800' :
                                                        n.type === 'WARNING' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' :
                                                            n.type === 'ERROR' ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' :
                                                                'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                                                ) : (
                                                    // Read Styles (Fainter/Desaturated or White but with type hint)
                                                    'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 opacity-75'
                                                )
                                                }`}
                                            onClick={() => {
                                                if (!n.read) markAsRead(n.id);
                                                if (n.link) window.location.href = n.link;
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-semibold ${!n.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {n.title}
                                                </span>
                                                <span className={`text-[10px] whitespace-nowrap ml-2 ${!n.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    {new Date(n.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`line-clamp-2 ${!n.read ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {n.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {permission === 'default' && (
                            <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <button
                                    onClick={requestPermission}
                                    className="w-full text-xs text-center text-primary h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors font-medium border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                >
                                    Tarayıcı Bildirimlerini Aç 🔔
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
