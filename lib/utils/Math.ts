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

  export const roundToHalf = (num: number) => {
    const flooredNum = Math.floor(num)
    const decimal = num - flooredNum
    if (decimal < 0.25) {
      return flooredNum
    } else if (decimal < 0.75) {
      return flooredNum + 0.5
    } else {
      return flooredNum + 1
    }
  }
}
