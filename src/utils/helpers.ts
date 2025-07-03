/**
 * Generate a random ID
 * @returns A random string ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Format a date to a readable string
 * @param date The date to format
 * @returns A formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a time to a readable string
 * @param date The date to format
 * @returns A formatted time string
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Truncate text to a certain length
 * @param text The text to truncate
 * @param maxLength The maximum length
 * @returns The truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce a function
 * @param func The function to debounce
 * @param wait The wait time in milliseconds
 * @returns A debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get sentiment color based on score
 * @param score The sentiment score (-1 to 1)
 * @returns A color string
 */
export const getSentimentColor = (score: number): string => {
  if (score > 0.3) return 'green';
  if (score > 0) return 'light-green';
  if (score > -0.3) return 'yellow';
  return 'red';
};