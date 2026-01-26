
'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Button } from '@/components/ui/button';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const lastNotifiedId = useRef<string | null>(null);

    const fetchNotifications = async (isPoll = false) => {
        try {
            const res = await axios.get('/api/notifications?limit=20');
            const newNotifications = res.data.notifications;
            setNotifications(newNotifications);
            setUnreadCount(res.data.unreadCount);

            // Toast Logic
            if (isPoll && newNotifications.length > 0) {
                const latest = newNotifications[0];
                // If it's new and unread and we haven't toasted it yet
                if (!latest.read && latest.id !== lastNotifiedId.current) {

                    // Only toast if it's REALLY new (e.g. created in last 1 minute) to avoid toast storm on page load
                    const secondsAgo = (new Date().getTime() - new Date(latest.createdAt).getTime()) / 1000;

                    if (secondsAgo < 60) {
                        enqueueSnackbar(`${latest.title}: ${latest.message}`, {
                            variant: latest.type === 'ERROR' ? 'error' : 'default',
                            anchorOrigin: { vertical: 'top', horizontal: 'right' }
                        });
                        lastNotifiedId.current = latest.id;
                    }
                }
            } else if (!isPoll && newNotifications.length > 0) {
                // Initial load, just set ref
                lastNotifiedId.current = newNotifications[0].id;
            }

        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(true), 15000); // 15s poll
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id?: string) => {
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
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                )}
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-semibold text-sm">Bildirimler</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAsRead()}
                                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                                >
                                    Tümünü Okundu İşaretle
                                </button>
                            )}
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
                                            className={`p-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                            onClick={() => !n.read && markAsRead(n.id)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-semibold ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {n.title}
                                                </span>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                    {new Date(n.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {n.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
