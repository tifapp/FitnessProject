import { SoundEffectName } from "@lib/SoundEffect"
import { LocalSettings } from "@settings-storage/LocalSettings"
import { SettingsStore } from "@settings-storage/Settings"
import { requireOptionalNativeModule } from "expo"
import { ReactNode, createContext, useContext } from "react"
import { logger } from "TiFShared/logging"

const TiFNativeHaptics = requireOptionalNativeModule("TifHaptics")

const log = logger("tif.haptics")

export const FEEDBACK_PARAMETER_IDS = [
  "HapticIntensity",
  "HapticSharpness",
  "AttackTime",
  "DecayTime",
  "ReleaseTime",
  "Sustained"
] as const

export type HapticFeedbackParameterID = (typeof FEEDBACK_PARAMETER_IDS)[number]

export const AUDIO_PARAMETER_IDS = [
  "AudioVolume",
  "AudioPan",
  "AudioPitch",
  "AudioBrightness"
] as const

export type HapticAudioParameterID = (typeof AUDIO_PARAMETER_IDS)[number]

export type HapticEventParameterID =
  | HapticFeedbackParameterID
  | HapticAudioParameterID

export type HapticEventParameter<ID extends HapticEventParameterID> = {
  ParameterID: ID
  ParameterValue: number
}

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
      EventDuration?: number
      EventParameters: HapticEventParameter<HapticFeedbackParameterID>[]
    }
  | {
      EventType: "HapticContinuous"
      EventParameters: HapticEventParameter<HapticFeedbackParameterID>[]
      EventDuration: number
    }
  | {
      EventType: "AudioCustom"
      EventWaveformPath: SoundEffectName
      EventDuration?: number
      EventWaveformLoopEnabled?: boolean
      EventWaveformUseVolumeEnvelope?: boolean
      EventParameters: HapticEventParameter<HapticAudioParameterID>[]
    }
  | {
      EventType: "AudioContinuous"
      EventDuration: number
      EventWaveformUseVolumeEnvelope?: boolean
      EventParameters: HapticEventParameter<HapticAudioParameterID>[]
    }
) & { Time: number }

export type AnyHapticEvent = {
  EventType: HapticEvent["EventType"]
  EventDuration?: number
  EventWaveformUseVolumeEnvelope?: boolean
  EventWaveformLoopEnabled?: boolean
  EventWaveformPath?: string
  EventParameters: HapticEventParameter<HapticEventParameterID>[]
  Time: number
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
  parameters: Partial<Record<HapticFeedbackParameterID, number>>,
  properties: { EventDuration?: number } = {}
): HapticEvent => {
  return {
    EventType: "HapticTransient",
    EventParameters: Object.entries(parameters).map(([key, value]) => ({
      ParameterID: key as HapticFeedbackParameterID,
      ParameterValue: value
    })),
    Time: relativeTime,
    ...properties
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
  path: SoundEffectName,
  relativeTime: number,
  parameters: Partial<Record<HapticAudioParameterID, number>>,
  waveformProperties: {
    EventDuration?: number
    EventWaveformLoopEnabled?: boolean
    EventWaveformUseVolumeEnvelope?: boolean
  } = {}
): HapticEvent => {
  return {
    EventType: "AudioCustom",
    EventWaveformPath: path,
    EventParameters: Object.entries(parameters).map(([key, value]) => ({
      ParameterID: key as HapticAudioParameterID,
      ParameterValue: value
    })),
    Time: relativeTime,
    ...waveformProperties
  }
}

/**
 * Returns an {@link HapticEvent} that plays a sound for a specified duration.
 *
 * You can customize the sound by changing the audio parameters. If you want to play a custom
 * sound effect, use {@link soundEffectEvent} instead.
 *
 * @param duration The amount of time to play the sound effect for.
 * @param relativeTime The time that this event plays relative to the other events in an {@link HapticPattern}.
 */
export const continuousSoundEvent = (
  relativeTime: number,
  duration: number,
  parameters: Partial<Record<HapticAudioParameterID, number>>,
  waveformProperties: { EventWaveformUseVolumeEnvelope?: boolean } = {}
): HapticEvent => {
  return {
    EventType: "AudioContinuous",
    EventDuration: duration,
    EventParameters: Object.entries(parameters).map(([key, value]) => ({
      ParameterID: key as HapticAudioParameterID,
      ParameterValue: value
    })),
    Time: relativeTime,
    ...waveformProperties
  }
}

export const CURVABLE_PARAMETER_IDS = [
  "HapticIntensityControl",
  "HapticSharpnessControl",
  "AudioVolumeControl",
  "AudioPanControl",
  "AudioPitchControl",
  "AudioBrightnessControl"
] as const

export type HapticCurvableParameterID = (typeof CURVABLE_PARAMETER_IDS)[number]

export const DYNAMIC_PARAMETER_IDS = [
  ...CURVABLE_PARAMETER_IDS,
  "HapticAttackTimeControl",
  "HapticDecayTimeControl",
  "HapticReleaseTimeControl",
  "AudioAttackTimeControl",
  "AudioDecayTimeControl",
  "AudioReleaseTimeControl"
] as const

export type HapticDynamicParameterID = (typeof DYNAMIC_PARAMETER_IDS)[number]

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
  ParameterID: HapticCurvableParameterID
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
  key: HapticCurvableParameterID,
  relativeTime: number,
  keyFrames: HapticParameterCurveKeyFrame[]
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

export type HapticPatternElement =
  | { Event: HapticEvent }
  | { Parameter: HapticDynamicParameter }
  | { ParameterCurve: HapticParameterCurve }

/**
 * Returns the time that this element plays relative to other events in an {@link HapticPattern}.
 */
export const time = (element: HapticPatternElement) => {
  if ("Event" in element) return element.Event.Time
  if ("Parameter" in element) return element.Parameter.Time
  return element.ParameterCurve.Time
}

/**
 * Returns a new {@link HapticPatternElement} with the time value updated to the specified time.
 */
export const changeTime = (
  element: HapticPatternElement,
  value: number
): HapticPatternElement => {
  if ("Event" in element) {
    return { Event: { ...element.Event, Time: value } }
  } else if ("Parameter" in element) {
    return { Parameter: { ...element.Parameter, Time: value } }
  } else {
    return { ParameterCurve: { ...element.ParameterCurve, Time: value } }
  }
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
  Pattern: HapticPatternElement[]
}

/**
 * Creates a {@link HapticPattern}.
 *
 * @param events An array of {@link HapticEvent}s.
 * @param parameters An optional array of parameters. This array must either be exclusively dynamic parameters or parameter curves.
 */
export const hapticPattern = (
  events: HapticEvent[],
  parameters: (HapticParameterCurve | HapticDynamicParameter)[] = []
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

/**
 * Returns an {@link HapticPattern} consisting of a single event.
 */
export const singleEventPattern = (event: HapticEvent): HapticPattern => {
  return { Pattern: [{ Event: event }] }
}

export const events = (...events: HapticEvent[]) => events
export const parameters = (
  ...parameters: (HapticParameterCurve | HapticDynamicParameter)[]
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
  apply: async (settings) => await TiFNativeHaptics.apply(settings)
} as Haptics

export type HapticsCompatibility = {
  isFeedbackSupportedOnDevice: boolean
  isAudioSupportedOnDevice: boolean
}

export type HapticsContextValues = Haptics & HapticsCompatibility

const HapticsContext = createContext<HapticsContextValues>({
  ...TiFHaptics,
  ...(TiFNativeHaptics?.deviceSupport?.() ?? {
    isFeedbackSupportedOnDevice: false,
    isAudioSupportedOnDevice: false
  })
})

/**
 * The current {@link Haptics} implementation provided by {@link HapticsProvider}.
 */
export const useHaptics = () => {
  const haptics = useContext(HapticsContext)
  return {
    ...haptics,
    /**
     * Plays the specified {@link HapticPattern} if the device supports all the required
     * capabilities specifed by `requiredCapabilities`.
     *
     * @param pattern The pattern to play.
     * @param requiredCapabilities The required hardware capabilties that the device must support.
     */
    playIfSupported: (
      pattern: HapticPattern,
      requiredCapabilities: (keyof HapticsCompatibility)[] = [
        "isAudioSupportedOnDevice",
        "isFeedbackSupportedOnDevice"
      ]
    ) => {
      if (requiredCapabilities.every((key) => haptics[key])) {
        haptics.play(pattern)
      }
    }
  }
}

export type HapticsProviderProps = {
  haptics: Haptics
  children: ReactNode
} & HapticsCompatibility

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
