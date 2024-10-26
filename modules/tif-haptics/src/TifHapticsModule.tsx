import { requireOptionalNativeModule } from "expo"
import { ReactNode, createContext, useContext } from "react"
import { LocalSettings } from "@settings-storage/LocalSettings"
import { logger } from "TiFShared/logging"
import { SettingsStore } from "@settings-storage/Settings"

const TiFNativeHaptics = requireOptionalNativeModule("TifHaptics") ?? {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  IS_HAPTICS_SUPPORTED: false
}

const log = logger("tif.haptics")

export type HapticFeedbackParameterID =
  | "HapticIntensity"
  | "HapticSharpness"
  | "HapticAttackTime"
  | "HapticDecayTime"
  | "HapticReleaseTime"
  | "HapticSustained"

export type HapticAudioParameterID =
  | "AudioVolume"
  | "AudioPan"
  | "AudioPitch"
  | "AudioBrightness"

/**
 * A type of haptic event to be played at a specified moment in time.
 *
 * Each type of haptic event has different characteristics.
 * - `"haptic-transient"` = An event that plays instantly.
 * - `"haptic-continuous"` = An event that plays for a specified duration.
 * - `"audio-sound-effect"` = An event that plays a sound effect.
 */
export type HapticEvent = (
  | {
      EventType: "HapticTransient"
      EventParameters: HapticEventParameter<HapticFeedbackParameterID>[]
    }
  | {
      EventType: "HapticContinuous"
      EventParameters: HapticEventParameter<HapticFeedbackParameterID>[]
      EventDuration: number
    }
  | {
      EventType: "AudioCustom"
      EventWaveFormPath: string
      EventParameters: HapticEventParameter<HapticAudioParameterID>[]
    }
) & { Time: number }

export type HapticEventParameter<
  ID extends HapticFeedbackParameterID | HapticAudioParameterID
> = {
  ParameterID: ID
  ParameterValue: number
}

/**
 * Returns a transient {@link HapticEvent}.
 *
 * Transient events play their effects instantaneously and not for a specified duration. For
 * continous playing, see {@link continuousEvent}.
 *
 * @param relativeTime The time that this event plays relative to the other events in an {@link HapticPattern}.
 */
export const transientEvent = (
  relativeTime: number,
  parameters: Partial<Record<HapticFeedbackParameterID, number>>
): HapticEvent => {
  return {
    EventType: "HapticTransient",
    EventParameters: Object.entries(parameters).map(([key, value]) => ({
      ParameterID: key as HapticFeedbackParameterID,
      ParameterValue: value
    })),
    Time: relativeTime
  }
}

/**
 * Returns a continous {@link HapticEvent}.
 *
 * Continous events play for a specified duration in seconds. To play a single event instantly,
 * see {@link transientEvent}.
 *
 * @param relativeTime The time that this event plays relative to the other events in an {@link HapticPattern}.
 * @param duration The duration of the continuous event.
 */
export const continuousEvent = (
  relativeTime: number,
  duration: number,
  parameters: Partial<Record<HapticFeedbackParameterID, number>>
): HapticEvent => {
  return {
    EventType: "HapticContinuous",
    EventDuration: duration,
    EventParameters: Object.entries(parameters).map(([key, value]) => ({
      ParameterID: key as HapticFeedbackParameterID,
      ParameterValue: value
    })),
    Time: relativeTime
  }
}

/**
 * Returns an {@link HapticEvent} that plays a sound effect.
 *
 * @param path The filename of the sound effect to play.
 * @param relativeTime The time that this event plays relative to the other events in an {@link HapticPattern}.
 */
export const soundEffectEvent = (
  path: string,
  relativeTime: number,
  parameters: Partial<Record<HapticAudioParameterID, number>>
): HapticEvent => {
  return {
    EventType: "AudioCustom",
    EventWaveFormPath: path,
    EventParameters: Object.entries(parameters).map(([key, value]) => ({
      ParameterID: key as HapticAudioParameterID,
      ParameterValue: value
    })),
    Time: relativeTime
  }
}

export type HapticDynamicParameterID =
  | "HapticIntensityControl"
  | "HapticSharpnessControl"
  | "HapticAttackTimeControl"
  | "HapticDecayTimeControl"
  | "HapticReleaseTimeControl"
  | "HapticSustainedControl"
  | "AudioVolumeControl"
  | "AudioPanControl"
  | "AudioPitchControl"
  | "AudioBrightnessControl"
  | "AudioAttackTimeControl"
  | "AudioDecayTimeControl"
  | "AudioReleaseTimeControl"

/**
 * A value that alters the playback of haptic event parameters at a particular time.
 *
 * For interpolation of parameter values over time, see {@link HapticParameterCurve}.
 */
export type HapticDynamicParameter = {
  ParameterID: HapticDynamicParameterID
  ParameterValue: number
  Time: number
}

/**
 * Returns a {@link HapticDynamicParameter}.
 *
 * For interpolation of parameter values over time, see {@link parameterCurve}.
 *
 * @param key See {@link HapticDynamicParameterID}
 * @param value The value to set the parameter to.
 * @param relativeTime The time that this parameter takes effect.
 */
export const dynamicParameter = (
  key: HapticDynamicParameterID,
  value: number,
  relativeTime: number
): HapticDynamicParameter => {
  return { ParameterID: key, ParameterValue: value, Time: relativeTime }
}

/**
 * A type that controls the change in a haptic parameter value using a key-frame system.
 *
 * For altering parameter values at a particular point see {@link HapticDynamicParameter}.
 */
export type HapticParameterCurve = {
  ParameterID: HapticDynamicParameterID
  Time: number
  ParameterCurveControlPoints: HapticParameterCurveKeyFrame[]
}

/**
 * Returns a {@link HapticParameterCurve}.
 *
 * For altering parameter values at a particular point see {@link HapticDynamicParameter}.
 *
 * @param key See {@link HapticDynamicParameterID}
 * @param relativeTime The time to start the parameter curve relative to the other events in a {@link hapticPattern}.
 * @param keyFrames The key frames to interpolate parameter values between.
 */
export const parameterCurve = (
  key: HapticDynamicParameterID,
  relativeTime: number,
  ...keyFrames: HapticParameterCurveKeyFrame[]
): HapticParameterCurve => {
  return {
    ParameterID: key,
    Time: relativeTime,
    ParameterCurveControlPoints: keyFrames
  }
}

/**
 * A key frame for a {@link HapticParameterCurve}.
 */
export type HapticParameterCurveKeyFrame = {
  ParameterValue: number
  Time: number
}

export const keyFrame = (
  value: number,
  time: number
): HapticParameterCurveKeyFrame => {
  return { ParameterValue: value, Time: time }
}

/**
 * A type for a haptic pattern.
 *
 * Haptic patterns are composed of events and parameters. See {@link HapticEvent},
 * {@link HapticDynamicParameter}, and {@link HapticParameterCurve} for more.
 *
 * You can create a pattern using {@link hapticPattern}.
 */
export type HapticPattern = {
  Pattern: (
    | { Event: HapticEvent }
    | { Parameter: HapticDynamicParameter }
    | { ParameterCurve: HapticParameterCurve }
  )[]
}

/**
 * Creates a {@link HapticPattern}.
 *
 * @param events An array of {@link HapticEvent}s.
 * @param parameters An optional array of parameters. This array must either be exclusively dynamic parameters or parameter curves.
 */
export const hapticPattern = (
  events: HapticEvent[],
  parameters: HapticParameterCurve[] | HapticDynamicParameter[] = []
): HapticPattern => {
  return {
    Pattern: [
      ...events.map((e) => ({ Event: e })),
      ...parameters.map((p) => {
        return "ParameterCurveControlPoints" in p
          ? { ParameterCurve: p }
          : { Parameter: p }
      })
    ]
  }
}

export const events = (...events: HapticEvent[]) => events
export const parameters = (
  ...parameters: HapticParameterCurve[] | HapticDynamicParameter[]
) => parameters

/**
 * Configuration settings for the underlying haptics engine.
 */
export type HapticsSettings = Pick<
  LocalSettings,
  "isHapticFeedbackEnabled" | "isHapticAudioEnabled"
>

/**
 * An interface for playing and configuring haptics.
 */
export interface Haptics {
  /**
   * Plays haptic feedback for the given {@link HapticPattern}.
   */
  play(pattern: HapticPattern): Promise<void>

  /**
   * Applies the settings to this underlying haptics engine.
   */
  apply(settings: HapticsSettings): Promise<void>
}

/**
 * Subscribes to the given {@link LocalSettingsStore} and applies haptic
 * related settings changes to the given {@link Haptics} instance.
 */
export const applyHapticDeviceSettingsChanges = (
  haptics: Haptics,
  localSettingsStore: SettingsStore<LocalSettings>
) => {
  localSettingsStore.subscribe((settings) => haptics.apply(settings))
}

/**
 * The default {@link Haptics} implementation which persists the mute state in async storage,
 * and uses CoreHaptics on iOS and Vibrator on Android.
 */
export const TiFHaptics = {
  play: async (pattern: HapticPattern) => {
    try {
      await TiFNativeHaptics.play(pattern)
    } catch (error) {
      log.warn("An error occurred when playing haptics", {
        error: error.message
      })
    }
  },
  apply: async () => {
    throw new Error("TODO: - Implement this natively")
  }
} as Haptics

export type HapticsContextValues = Haptics & {
  isFeedbackSupportedOnDevice: boolean
  isAudioSupportedOnDevice: boolean
}

const HapticsContext = createContext<HapticsContextValues>({
  ...TiFHaptics,
  isFeedbackSupportedOnDevice: !!TiFNativeHaptics.IS_HAPTICS_SUPPORTED,
  isAudioSupportedOnDevice: true // TODO: - Native Code
})

/**
 * The current {@link Haptics} implementation provided by {@link HapticsProvider}.
 */
export const useHaptics = () => useContext(HapticsContext)

export type HapticsProviderProps = {
  haptics: Haptics
  isFeedbackSupportedOnDevice: boolean
  isAudioSupportedOnDevice: boolean
  children: ReactNode
}

/**
 * Provider for {@link Haptics}.
 */
export const HapticsProvider = ({
  children,
  haptics,
  isFeedbackSupportedOnDevice,
  isAudioSupportedOnDevice
}: HapticsProviderProps) => (
  <HapticsContext.Provider
    value={{
      play: (event) => haptics.play(event),
      apply: (settings) => haptics.apply(settings),
      isFeedbackSupportedOnDevice,
      isAudioSupportedOnDevice
    }}
  >
    {children}
  </HapticsContext.Provider>
)
