export type CallbackCollectionUnsubscribe = () => void

/**
 * A simple class for doing multi-subscriber pub-sub.
 */
export class CallbackCollection<Arg> {
  private currentId = 0
  // eslint-disable-next-line func-call-spacing
  private callbacks = new Map<number, (arg: Arg) => void>()

  get count() {
    return this.callbacks.size
  }

  add(callback: (arg: Arg) => void): CallbackCollectionUnsubscribe {
    this.currentId++
    this.callbacks.set(this.currentId, callback)
    return this.callbacks.delete.bind(this.callbacks, this.currentId)
  }

  send(arg: Arg) {
    // eslint-disable-next-line n/no-callback-literal
    this.callbacks.forEach((callback) => callback(arg))
  }
}
