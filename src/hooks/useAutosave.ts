import { useState, useEffect, useRef } from 'react';

export function useAutosave(callback: () => void, delay: number = 3000) {
    const [isAutosaving, setIsAutosaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const trigger = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(async () => {
            setIsAutosaving(true);
            try {
                await callback();
                setLastSavedAt(new Date());
            } catch (error) {
                console.error('Autosave failed:', error);
            } finally {
                setIsAutosaving(false);
            }
        }, delay);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return { trigger, isAutosaving, lastSavedAt };
}
