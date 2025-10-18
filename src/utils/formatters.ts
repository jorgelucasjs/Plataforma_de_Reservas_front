// Currency formatting utilities

/**
 * Format a number as currency (Euro)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  } = {}
): string {
  const {
    locale = 'pt-PT',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'EUR',
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return formatter.format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return showSymbol ? `€${amount.toFixed(2)}` : amount.toFixed(2);
  }
}

/**
 * Format currency for compact display (e.g., 1.2K, 1.5M)
 * @param amount - The amount to format
 * @param locale - The locale to use for formatting
 * @returns Compact formatted currency string
 */
export function formatCompactCurrency(amount: number, locale: string = 'pt-PT'): string {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1,
    });

    return formatter.format(amount);
  } catch (error) {
    console.error('Error formatting compact currency:', error);
    
    // Fallback formatting
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(1)}K`;
    } else {
      return `€${amount.toFixed(2)}`;
    }
  }
}

// Date formatting utilities

/**
 * Format a date string or Date object for display
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options: {
    locale?: string;
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
    includeTime?: boolean;
  } = {}
): string {
  const {
    locale = 'pt-PT',
    dateStyle = 'medium',
    timeStyle = 'short',
    includeTime = false,
  } = options;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      dateStyle,
      timeStyle: includeTime ? timeStyle : undefined,
    });

    return formatter.format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return typeof date === 'string' ? date : date.toLocaleDateString();
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - The date to format
 * @param locale - The locale to use for formatting
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date, locale: string = 'pt-PT'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    // Define time units in seconds
    const units: Array<[string, number]> = [
      ['year', 31536000],
      ['month', 2592000],
      ['week', 604800],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
      ['second', 1],
    ];

    for (const [unit, secondsInUnit] of units) {
      const value = Math.floor(Math.abs(diffInSeconds) / secondsInUnit);
      
      if (value >= 1) {
        return formatter.format(diffInSeconds < 0 ? value : -value, unit as Intl.RelativeTimeFormatUnit);
      }
    }

    return formatter.format(0, 'second');
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Unknown time';
  }
}

/**
 * Format date for form inputs (YYYY-MM-DD)
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}

/**
 * Format datetime for form inputs (YYYY-MM-DDTHH:mm)
 * @param date - The date to format
 * @returns Datetime string in YYYY-MM-DDTHH:mm format
 */
export function formatDateTimeForInput(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error formatting datetime for input:', error);
    return '';
  }
}

// Text formatting utilities

/**
 * Truncate text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Truncate text by words instead of characters
 * @param text - The text to truncate
 * @param maxWords - Maximum number of words
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateWords(text: string, maxWords: number, suffix: string = '...'): string {
  if (!text) {
    return text;
  }

  const words = text.split(' ');
  
  if (words.length <= maxWords) {
    return text;
  }

  return words.slice(0, maxWords).join(' ') + suffix;
}

/**
 * Capitalize the first letter of a string
 * @param text - The text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert text to title case
 * @param text - The text to convert
 * @returns Title case text
 */
export function toTitleCase(text: string): string {
  if (!text) {
    return text;
  }

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format user type for display
 * @param userType - The user type ('client' or 'provider')
 * @returns Formatted user type
 */
export function formatUserType(userType: 'client' | 'provider'): string {
  const typeMap = {
    client: 'Cliente',
    provider: 'Prestador',
  };

  return typeMap[userType] || capitalize(userType);
}

/**
 * Format booking status for display
 * @param status - The booking status
 * @returns Formatted status
 */
export function formatBookingStatus(status: 'confirmed' | 'cancelled'): string {
  const statusMap = {
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
  };

  return statusMap[status] || capitalize(status);
}

// Number formatting utilities

/**
 * Format a number with thousands separators
 * @param number - The number to format
 * @param locale - The locale to use for formatting
 * @returns Formatted number string
 */
export function formatNumber(number: number, locale: string = 'pt-PT'): string {
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return number.toString();
  }
}

/**
 * Format a percentage
 * @param value - The decimal value (e.g., 0.15 for 15%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    locale = 'pt-PT',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return formatter.format(value);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${(value * 100).toFixed(2)}%`;
  }
}

// Utility functions for common formatting patterns

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format phone number for display
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Portuguese phone number formatting
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  // International format
  if (cleaned.length > 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '+$1 $2 $3 $4');
  }

  return phoneNumber;
}

/**
 * Format NIF for display
 * @param nif - The NIF to format
 * @returns Formatted NIF
 */
export function formatNIF(nif: string): string {
  // Remove all non-digit characters
  const cleaned = nif.replace(/\D/g, '');

  // Portuguese NIF formatting (9 digits)
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  return nif;
}

// Export all formatters as a single object for convenience
export const formatters = {
  currency: formatCurrency,
  compactCurrency: formatCompactCurrency,
  date: formatDate,
  relativeTime: formatRelativeTime,
  dateForInput: formatDateForInput,
  dateTimeForInput: formatDateTimeForInput,
  truncateText,
  truncateWords,
  capitalize,
  toTitleCase,
  userType: formatUserType,
  bookingStatus: formatBookingStatus,
  number: formatNumber,
  percentage: formatPercentage,
  fileSize: formatFileSize,
  phoneNumber: formatPhoneNumber,
  nif: formatNIF,
};