/**
 * Converts miles to meters.
 */
export const milesToMeters = (miles: number) => miles * METERS_PER_MILE

/**
 * Converts meters to miles.
 */
export const metersToMiles = (meters: number) => meters / METERS_PER_MILE

export const yardsToMeters = (yards: number) => yards * YARDS_PER_METER

export const milesToFeet = (miles: number) => miles * FEET_PER_MILE

const YARDS_PER_METER = 0.91444
const METERS_PER_MILE = 1609.344
const FEET_PER_MILE = 5280
