import { HapticEvent, Haptics } from "@lib/Haptics"

export class TestHaptics implements Haptics {
  private _playedEvents = [] as HapticEvent[]
  private _isMuted = false

  get playedEvents () {
    return this._playedEvents
  }

  get isMuted () {
    return this._isMuted
  }

  async play (event: HapticEvent) {
    if (!this._isMuted) {
      this._playedEvents.push(event)
    }
  }

  mute () {
    this._isMuted = true
  }

  unmute () {
    this._isMuted = false
  }
}
