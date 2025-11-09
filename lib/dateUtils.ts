/**
 * Date formatting utilities
 */

/**
 * Format date for step display
 */
export function formatStepDate(dateString: string | null): string {
  if (!dateString) {
    return 'No date set';
  }

  const date = new Date(dateString);
  const now = new Date();

  // Check if it's today
  if (isToday(date)) {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `Today at ${timeStr}`;
  }

  // Check if it's tomorrow
  if (isTomorrow(date)) {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `Tomorrow at ${timeStr}`;
  }

  // Check if it's within the next 7 days
  const daysUntil = getDaysUntil(date);
  if (daysUntil > 0 && daysUntil <= 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dayName} at ${timeStr}`;
  }

  // Default format
  return formatDateTime(date);
}

/**
 * Format relative date (e.g., "Today", "Tomorrow", "In 3 days")
 */
export function formatRelativeDate(dateString: string | null): string {
  if (!dateString) {
    return 'No date';
  }

  const date = new Date(dateString);

  if (isToday(date)) {
    return 'Today';
  }

  if (isTomorrow(date)) {
    return 'Tomorrow';
  }

  const daysUntil = getDaysUntil(date);

  if (daysUntil < 0) {
    const daysAgo = Math.abs(daysUntil);
    if (daysAgo === 1) {
      return 'Yesterday';
    }
    return `${daysAgo} days ago`;
  }

  if (daysUntil === 0) {
    return 'Today';
  }

  if (daysUntil === 1) {
    return 'Tomorrow';
  }

  if (daysUntil <= 7) {
    return `In ${daysUntil} days`;
  }

  // For dates further out, show the actual date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format full date and time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date only (no time)
 */
export function formatDateOnly(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if date is in the past
 */
export function isPastDue(date: Date | string | null): boolean {
  if (!date) {
    return false;
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Compare dates (ignore time)
  const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return dateOnly < nowOnly;
}

/**
 * Calculate days until date (negative if in the past)
 */
export function getDaysUntil(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Set both to midnight for accurate day calculation
  const dateMidnight = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dateMidnight.getTime() - nowMidnight.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get time string from date
 */
export function getTimeString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

