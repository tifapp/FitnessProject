import { US_LOCALE } from "./Locale"

/**
 * Formats miles into a compact format suitable for displaying in small UI spaces.
 *
 * If `miles` < 0.1, then it will format into `0.1 mi` instead.
 */
export const compactFormatMiles = (
  miles: number,
  locale: string = US_LOCALE
) => {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    style: "unit",
    unit: "mile",
    useGrouping: false
  }).format(Math.max(miles, 0.1))
}

/**
 * Formats a feet value into something suitable for small UI spaces (eg. location search result).
 *
 * This formatter will round the feet to the nearest whole number and format "1" when feet < 1.
 */
export const compactFormatFeet = (feet: number, locale: string = US_LOCALE) => {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    style: "unit",
    unit: "foot",
    useGrouping: false
  }).format(Math.max(Math.round(feet), 1))
}
