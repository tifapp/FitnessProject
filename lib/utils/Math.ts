export namespace MathUtils {
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
   * Rounds to the nearest fractional denominator. (eg. 2 -> 0.5, 3 -> 0.334)
   */
  export const roundToDenominator = (num: number, denominator: number) => {
    return Math.round(num * denominator) / denominator
  }
}
