/**
 * Creates a random boolean.
 *
 * @param falseChance A range of [0,1) describing the chance of the result being false.
 */
export const randomBool = (falseChance: number = 0.5) => {
  return Math.random() > falseChance
}
