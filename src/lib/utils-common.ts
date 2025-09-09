/**
 * Centralized utility functions for common operations
 */

/**
 * Format amount as Indian Rupees currency
 */
export const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * Format weight for display
 */
export const formatWeight = (weight: number): string => {
    return `${weight} kg`;
};

/**
 * Format delivery time range
 */
export const formatDeliveryTime = (minDays: number, maxDays: number): string => {
    if (minDays === maxDays) {
        return `${minDays} day${minDays !== 1 ? 's' : ''}`;
    }
    return `${minDays}-${maxDays} days`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Generate unique ID for components
 */
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

/**
 * Check if email is valid
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase());
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
