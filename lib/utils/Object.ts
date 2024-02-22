export namespace ObjectUtils {
  export const removeUndefined = <Obj extends { [key: string]: any }>(
    obj: Obj
  ) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    ) as Obj
  }
}
