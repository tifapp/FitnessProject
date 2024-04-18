import { uuidString } from "./UUID"

/**
 * A simple class for doing multi-subscriber pub-sub.
 */
export class CallbackCollection<Arg> {
  // eslint-disable-next-line func-call-spacing
  private callbacks = new Map<string, (arg: Arg) => void>()

  get count() {
    return this.callbacks.size
  }

  add(callback: (arg: Arg) => void) {
    const id = uuidString()
    this.callbacks.set(id, callback)
    return () => {
      this.callbacks.delete(id)
    }
  }

  send(arg: Arg) {
    // eslint-disable-next-line n/no-callback-literal
    this.callbacks.forEach((callback) => callback(arg))
  }
}
