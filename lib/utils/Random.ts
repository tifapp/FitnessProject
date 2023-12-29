/**
 * Creates a random boolean.
 *
 * @param falseChance A range of [0,1) describing the chance of the result being false.
 */
export const randomBool = (falseChance: number = 0.5) => {
  return Math.random() > falseChance
}

/**
 * Returns a random float in the given range.
 */
export const randomFloatInRange = (lower: number, upper: number) => {
  return lower + Math.random() * (upper - lower)
}

/**
 * Given a value, randomly returns null or the value.
 *
 * @param value the non-null value to return
 * @param nullChance the chance in range [0, 1) in which null is returned (default: 0.5)
 */
export const randomlyNull = <Value>(value: Value, nullChance: number = 0.5) => {
  return randomBool(nullChance) ? null : value
}
