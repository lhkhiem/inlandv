/**
 * Utility functions for cleaning and processing content from CMS
 */

/**
 * Remove HTML tags from a string
 */
export function stripHtmlTags(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Clean text content - remove HTML tags and normalize whitespace
 */
export function cleanText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return stripHtmlTags(text)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clean an object's string properties by removing HTML tags
 */
export function cleanObjectStrings<T extends Record<string, any>>(obj: T): T {
  const cleaned = { ...obj };
  for (const key in cleaned) {
    if (typeof cleaned[key] === 'string') {
      cleaned[key] = cleanText(cleaned[key]) as any;
    } else if (Array.isArray(cleaned[key])) {
      cleaned[key] = cleaned[key].map((item: any) => {
        if (typeof item === 'string') {
          return cleanText(item);
        } else if (typeof item === 'object' && item !== null) {
          return cleanObjectStrings(item);
        }
        return item;
      }) as any;
    } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
      cleaned[key] = cleanObjectStrings(cleaned[key]) as any;
    }
  }
  return cleaned;
}

















