import { US_LOCALE } from "./Locale"
import { FEET_PER_MILE } from "./Math"

/**
 * Formats miles into a compact format suitable for displaying in small UI spaces.
 *
 * Format: "{`miles` rounded to the nearest tenth} mi"
 *
 * If `miles` < 0.1, then it will format into feet instead.
 */
export const compactFormatMiles = (
  miles: number,
  locale: string = US_LOCALE
) => {
  const unit = miles < 0.1 ? "foot" : "mile"
  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    style: "unit",
    unit
  })

  if (unit === "foot") {
    const roundedFeet = Math.round(miles * FEET_PER_MILE)
    return formatter.format(Math.max(roundedFeet, 1))
  }
  return formatter.format(miles)
}
