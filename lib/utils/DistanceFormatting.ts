import { milesToFeet } from "./MetricConversions"

/**
 * Formats miles into a compact format suitable for displaying in small UI spaces.
 *
 * If `miles` < 0.1, then it will format into `0.1 mi` instead.
 */
export const compactFormatMiles = (miles: number) => {
  // TODO: - Intl Format + Locale Param
  return `${Math.max(parseFloat(miles.toFixed(1)), 0.1)} mi`
}

/**
 * Formats a feet value into something suitable for small UI spaces (eg. location search result).
 *
 * This formatter will round the feet to the nearest whole number and format "1" when feet < 1.
 */
export const compactFormatFeet = (feet: number) => {
  /// TODO: - Intl Format + Locale Param
  return `${Math.max(Math.round(feet), 1)} ft`
}

/**
 * Formats a distance in miles.
 *
 * If `miles` is less than 0.1, then it formats in feet.
 */
export const compactFormatDistance = (miles: number) => {
  if (miles < 0.1) return compactFormatFeet(milesToFeet(miles))
  return compactFormatMiles(miles)
}
