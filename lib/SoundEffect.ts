import { Platform } from "react-native"

/**
 * A string for the name of a sound effect that is either a `.mp3` file (Android) or a `.caf` file (iOS).
 */
export type SoundEffectName<Name extends string = string> =
  | `${Name}.caf`
  | `${Name}.mp3`

const soundEffectName = <const N extends string>(name: N) => {
  return Platform.select({
    ios: `${name}.caf`,
    android: `${name}.mp3`
  }) as SoundEffectName<N>
}

/**
 * The sound effect names that have files stored in the main bundle of the app.
 */
export const BUNDLED_SOUND_EFFECT_NAMES = [
  soundEffectName("wind"),
  soundEffectName("fall"),
  soundEffectName("appear")
] as const
