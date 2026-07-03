/**
 * cn — minimal class name combiner.
 * Filters falsy values and joins the rest with spaces.
 * Accepts strings, numbers, booleans, null, and objects.
 */
type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Record<string, boolean>;

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .map((input) => {
      if (input == null || typeof input === 'boolean') return '';
      if (typeof input === 'object') {
        return Object.entries(input)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(' ');
      }
      return String(input);
    })
    .filter(Boolean)
    .join(' ');
}
