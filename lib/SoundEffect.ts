import { Platform } from "react-native"

/**
 * A string for the name of a sound effect that is either a `.wav` file (Android) or a `.caf` file (iOS).
 */
export type SoundEffectName<Name extends string = string> =
  | `${Name}.caf`
  | `${Name}.wav`

const soundEffectName = <const N extends string>(name: N) => {
  return Platform.select({
    ios: `${name}.caf`,
    android: `${name}.wav`
  }) as SoundEffectName<N>
}

/**
 * The sound effect names that have files stored in the main bundle of the app.
 */
export const BUNDLED_SOUND_EFFECT_NAMES = [
  soundEffectName("test"),
  soundEffectName("fall"),
  soundEffectName("appear")
] as const
