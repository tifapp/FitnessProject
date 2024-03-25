export namespace ObjectUtils {
  /**
   * Removes all keys that have a value of undefined from the given object.
   */
  export const removeUndefined = <Obj extends { [key: string]: any }>(
    obj: Obj
  ) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    ) as Obj
  }
}
