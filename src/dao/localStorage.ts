/**
 * Utility functions for localStorage management
 */

/**
 * Get data from localStorage
 * @param key - The key to retrieve data from localStorage
 * @returns The parsed data or null if not found
 */
export function getData(key: string): any {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting data from localStorage for key ${key}:`, error);
    return null;
  }
}

/**
 * Set data to localStorage
 * @param key - The key to store data in localStorage
 * @param value - The value to store
 */
export function setData(key: string, value: any): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting data to localStorage for key ${key}:`, error);
  }
}

/**
 * Remove data from localStorage
 * @param key - The key to remove from localStorage
 */
export function removeData(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data from localStorage for key ${key}:`, error);
  }
}

/**
 * Clear all data from localStorage
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Check if a key exists in localStorage
 * @param key - The key to check
 * @returns true if key exists, false otherwise
 */
export function hasData(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return localStorage.getItem(key) !== null;
}