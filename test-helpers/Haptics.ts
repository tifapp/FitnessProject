import { HapticEvent, Haptics, HapticsSettings } from "@modules/tif-haptics"

export class TestHaptics implements Haptics {
  private _playedEvents = [] as HapticEvent[]
  private _settings = {
    isHapticFeedbackEnabled: true,
    isHapticAudioEnabled: true
  }

  get playedEvents() {
    return this._playedEvents
  }

  get settings() {
    return this._settings
  }

  async play(event: HapticEvent) {
    this._playedEvents.push(event)
  }

  async apply(settings: HapticsSettings) {
    this._settings = settings
  }
}
