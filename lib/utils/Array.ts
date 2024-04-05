export namespace ArrayUtils {
  /**
   * Returns a random element from an array which has at least one element.
   */
  export const randomElement = <T>(arr: T[]) => {
    return arr[Math.floor(Math.random() * arr.length)]
  }
}

// eslint-disable-next-line no-extend-native
Array.prototype.with =
  Array.prototype.with ||
  function (index: number, element: any) {
    return this.map((value: any, i: number) => {
      if (index === i) return element
      return value
    })
  }
