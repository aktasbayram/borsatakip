import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: "TRY" | "USD" = "TRY") {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: currency,
    }).format(value);
}

export function formatNumber(value: number) {
    return new Intl.NumberFormat("tr-TR", {
        maximumFractionDigits: 2,
    }).format(value);
}

export function isIpoTradingToday(firstTradingDate?: string) {
    if (!firstTradingDate) return false;

    try {
        // Format today's date in Turkish (e.g. "6 Şubat 2026")
        // forcing tr-TR locale and Europe/Istanbul timezone for consistency
        const today = new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Europe/Istanbul'
        }).format(new Date());

        // Basic string comparison after normalizing whitespace
        // Also handle potential case differences just in case
        return firstTradingDate.trim().toLowerCase() === today.trim().toLowerCase();
    } catch (e) {
        return false;
    }
}
