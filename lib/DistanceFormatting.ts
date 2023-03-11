/**
 * Formats miles into a compact format suitable for displaying in small UI spaces.
 *
 * Format: "{`miles` rounded to the nearest tenth} mi"
 *
 * If `miles` < 0.1, then it will use 0.1 as the formatted amount.
 */
export const compactFormatMiles = (miles: number) => {
  // TODO: - Support multiple locales
  return `${Math.max(parseFloat(miles.toFixed(1)), 0.1)} mi`
}
