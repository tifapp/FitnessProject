import { HapticPattern, Haptics, HapticsSettings } from "@modules/tif-haptics"

export class TestHaptics implements Haptics {
  private _playedEvents = [] as HapticPattern[]
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

  async play(pattern: HapticPattern) {
    this._playedEvents.push(pattern)
  }

  async apply(settings: HapticsSettings) {
    this._settings = settings
  }

  reset() {
    this._playedEvents = []
    this._settings = {
      isHapticFeedbackEnabled: true,
      isHapticAudioEnabled: true
    }
  }
}
