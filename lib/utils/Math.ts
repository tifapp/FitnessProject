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
}
