import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Format a date string to the user's local timezone
 * @param date - ISO 8601 date string from API (UTC)
 * @param options - Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string in user's local timezone
 */
export const getFormattedDate = (
    date: string | null | undefined,
    options?: Intl.DateTimeFormatOptions,
) => {
    if (!date) return 'N/A';

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
    };

    return new Intl.DateTimeFormat('default', defaultOptions).format(new Date(date));
};

/**
 * Format a date string with relative time (e.g., "2 hours ago")
 * @param date - ISO 8601 date string from API (UTC)
 * @returns Relative time string in user's local timezone
 */
export const getRelativeTime = (date: string | null | undefined) => {
    if (!date) return 'N/A';

    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat('default', { numeric: 'auto' });

    if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
};

/**
 * Format date for display with timezone abbreviation
 * @param date - ISO 8601 date string from API (UTC)
 * @returns Formatted date with timezone (e.g., "Nov 20, 2025, 3:30 PM PST")
 */
export const getFormattedDateWithTimezone = (date: string | null | undefined) => {
    if (!date) return 'N/A';

    return new Intl.DateTimeFormat('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    }).format(new Date(date));
};
