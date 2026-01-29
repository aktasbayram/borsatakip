"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export interface DashboardPreferences {
    showAgenda: boolean;
    showIpo: boolean;
    showIndices: boolean;
    showWatchlist?: boolean; // Future proofing
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
    showAgenda: true,
    showIpo: true,
    showIndices: true,
};

const STORAGE_KEY = "dashboard-preferences-v1";

export function useDashboardPreferences() {
    const { data: session, status } = useSession();
    const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        const loadPreferences = async () => {
            setLoading(true);

            // 1. Authenticated User: Load from API
            if (status === "authenticated") {
                try {
                    const res = await axios.get("/api/user/preferences");
                    if (res.data) {
                        setPreferences((prev) => ({
                            ...prev,
                            // Verify keys exist in response, fallback to default/prev
                            showAgenda: res.data.showAgenda !== undefined ? res.data.showAgenda : prev.showAgenda,
                            showIpo: res.data.showIpo !== undefined ? res.data.showIpo : prev.showIpo,
                            showIndices: res.data.showIndices !== undefined ? res.data.showIndices : prev.showIndices,
                        }));
                    }
                } catch (error) {
                    console.error("Failed to fetch preferences from API", error);
                }
            }
            // 2. Guest User: Load from LocalStorage
            else if (status === "unauthenticated") {
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        setPreferences(JSON.parse(stored));
                    }
                } catch (error) {
                    console.error("Failed to read from localStorage", error);
                }
            }

            setLoading(false);
        };

        if (status !== "loading") {
            loadPreferences();
        }
    }, [status]);

    // Update preference
    const updatePreference = useCallback(async (key: keyof DashboardPreferences, value: boolean) => {
        // Update local state immediately (optimistic)
        setPreferences((prev) => {
            const newPrefs = { ...prev, [key]: value };

            // If guest, save to localStorage
            if (status === "unauthenticated") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
            }

            return newPrefs;
        });

        // If authenticated, sync with API
        if (status === "authenticated") {
            try {
                await axios.post("/api/user/preferences", { [key]: value });
            } catch (error) {
                console.error("Failed to sync preference with API", error);
            }
        }

        // Notify other components (Guest & Auth)
        window.dispatchEvent(new Event('dashboard-preferences-updated'));
    }, [status]);

    // Listen for updates from other components
    useEffect(() => {
        const handleUpdate = () => {
            // Reload preferences from storage/source
            // For guest: read localStorage
            // For auth: we could fetch API, but to be fast we can just read localStorage if we cached it, 
            // OR better: we can store the "latest" in a global object or just re-read localstorage for guests.
            // For simplicity for guests, re-read localStorage.
            if (status === 'unauthenticated') {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setPreferences(JSON.parse(stored));
                }
            } else if (status === 'authenticated') {
                // For auth users, refetching is safest to sync
                // Re-trigger the load effect? 
                // Let's extract the load logic.
                const loadFromApi = async () => {
                    try {
                        const res = await axios.get("/api/user/preferences");
                        if (res.data) {
                            setPreferences((prev) => ({
                                ...prev,
                                showAgenda: res.data.showAgenda !== undefined ? res.data.showAgenda : prev.showAgenda,
                                showIpo: res.data.showIpo !== undefined ? res.data.showIpo : prev.showIpo,
                                showIndices: res.data.showIndices !== undefined ? res.data.showIndices : prev.showIndices,
                            }));
                        }
                    } catch (err) { console.error(err); }
                };
                loadFromApi();
            }
        };

        window.addEventListener('dashboard-preferences-updated', handleUpdate);
        return () => window.removeEventListener('dashboard-preferences-updated', handleUpdate);
    }, [status]);

    return {
        preferences,
        updatePreference,
        loading,
        isAuthenticated: status === "authenticated"
    };
}
