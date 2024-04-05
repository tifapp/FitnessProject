export namespace ArrayUtils {}

// eslint-disable-next-line no-extend-native
Array.prototype.with =
  Array.prototype.with ||
  function (index: number, element: any) {
    return this.map((value: any, i: number) => {
      if (index === i) return element
      return value
    })
  }
