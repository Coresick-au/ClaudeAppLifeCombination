/**
 * Format a Date to Australian dd/mm/yyyy format.
 */
export function formatDateAU(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a Date to a readable Australian format like "24 Mar 2026".
 */
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Parse an ISO date string to Australian dd/mm/yyyy.
 */
export function isoToAU(iso: string): string {
  return formatDateAU(new Date(iso));
}
