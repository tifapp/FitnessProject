/**
 * Converts degrees to radians.
 */
export const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180

/**
 * Trig identity for sin^2(x)
 *
 * @param x radians
 */
export const sin2 = (radians: number) => (1 - Math.cos(2 * radians)) / 2

/**
 * Converts miles to meters.
 */
export const milesToMeters = (miles: number) => miles * METERS_PER_MILE

/**
 * Converts meters to miles.
 */
export const metersToMiles = (meters: number) => meters / METERS_PER_MILE

export const yardsToMeters = (yards: number) => yards * YARDS_PER_METER

export const YARDS_PER_METER = 0.91444
export const EARTH_RADIUS_METERS = 6371e3
export const METERS_PER_MILE = 1609.344
export const FEET_PER_MILE = 5280
