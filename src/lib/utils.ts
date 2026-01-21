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
