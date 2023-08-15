import { HapticEvent, Haptics } from "@lib/Haptics"

export class TestHaptics implements Haptics {
  private _playedEvents = [] as HapticEvent[]
  private isMuted = false

  get playedEvents () {
    return this._playedEvents
  }

  async play (event: HapticEvent) {
    if (!this.isMuted) {
      this._playedEvents.push(event)
    }
  }

  mute () {
    this.isMuted = true
  }

  unmute () {
    this.isMuted = false
  }
}
