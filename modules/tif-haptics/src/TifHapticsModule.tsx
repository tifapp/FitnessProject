import { LocalSettings } from "@settings-storage/LocalSettings"
import { SettingsStore } from "@settings-storage/Settings"
import { requireOptionalNativeModule } from "expo"
import * as ExpoHaptics from "expo-haptics"
import { ReactNode, createContext, useContext } from "react"
import { Platform, Vibration } from "react-native"
import { logger } from "TiFShared/logging"
import {
  createFadeOutPattern,
  createHeartbeatPattern,
  createRoarPattern,
  createThudPattern
} from "./HapticPatterns"

enum TiFNativeHapticEvent {
  Selection = "selection",
}

const TiFNativeHaptics = requireOptionalNativeModule("TifHaptics") ?? {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  IS_HAPTICS_SUPPORTED: false
}

const log = logger("tif.haptics")

/**
 * A function type to indicate haptic feedback being played to the user.
 */
export type HapticEvent = { name: "selection" };

/**
 * Configuration settings for the underlying haptics engine.
 */
export type HapticsSettings = Pick<
  LocalSettings,
  "isHapticFeedbackEnabled" | "isHapticAudioEnabled"
>;

const toNativeHapticEvent = (_: HapticEvent) => {
  // TODO: - Add more events
  return TiFNativeHapticEvent.Selection
}

/**
 * An interface for playing and configuring haptics.
 */
export interface Haptics {
  /**
   * Plays haptic feedback for the given {@link HapticEvent}.
   */
  play(event: HapticEvent): Promise<void>;

  /**
   * Plays a custom haptic pattern defined by a JSON string.
   */
  playCustomPattern(jsonPattern: any): Promise<void>;

  /**
   * Applies the settings to this underlying haptics engine.
   */
  apply(settings: HapticsSettings): Promise<void>;

  playHeartbeat(): Promise<void>;

  playFadeOut(): Promise<void>;

  playRoar(): Promise<void>;

  playThud(): Promise<void>;
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
 * Helper function to process and play haptic patterns on Android.
 */
async function processPattern(pattern: any): Promise<void> {
  if (Platform.OS === "ios") {
    try {
      await TiFNativeHaptics.playCustomPattern(JSON.stringify(pattern))
    } catch (error: any) {
      log.warn("An error occurred when playing haptics", {
        error: error.message
      })
    }
  } else if (Platform.OS === "android") {
    // TODO: Native Android haptics module
    // Uses Vibration API + Expo Haptics currently
    const events = pattern.events
    events.sort((a: any, b: any) => a.relativeTime - b.relativeTime)

    const startTime = Date.now()

    for (const event of events) {
      const currentTime = Date.now()
      const eventStartTime = startTime + event.relativeTime * 1000
      const delay = eventStartTime - currentTime

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      if (event.eventType === "hapticTransient") {
        const intensityParam = event.parameters.find(
          (p: any) => p.parameterID === "hapticIntensity"
        )
        const intensity = intensityParam ? intensityParam.value : 1.0

        let hapticStyle = ExpoHaptics.ImpactFeedbackStyle.Medium
        if (intensity >= 0.7) {
          hapticStyle = ExpoHaptics.ImpactFeedbackStyle.Heavy
        } else if (intensity <= 0.3) {
          hapticStyle = ExpoHaptics.ImpactFeedbackStyle.Light
        }

        await ExpoHaptics.impactAsync(hapticStyle)
      } else if (event.eventType === "hapticContinuous") {
        const duration = event.duration * 1000
        Vibration.vibrate(duration)
        await new Promise((resolve) => setTimeout(resolve, duration))
      }
    }
  } else {
    log.warn("Haptic feedback not supported on this platform")
  }
}

/**
 * The default {@link Haptics} implementation which persists the mute state in async storage,
 * and uses CoreHaptics on iOS and Vibrator on Android.
 */
export const TiFHaptics = {
  play: async (event: HapticEvent) => {
    try {
      await TiFNativeHaptics.play(toNativeHapticEvent(event))
    } catch (error: any) {
      log.warn("An error occurred when playing haptics", {
        error: error.message
      })
    }
  },
  playCustomPattern: async (pattern: any) => {
    await processPattern(pattern)
  },
  apply: async () => {
    throw new Error("TODO: - Implement this natively")
  },
  playHeartbeat: async () => {
    const pattern = createHeartbeatPattern()
    await processPattern(pattern)
  },
  playFadeOut: async () => {
    const pattern = createFadeOutPattern()
    await processPattern(pattern)
  },
  playRoar: async () => {
    const pattern = createRoarPattern()
    await processPattern(pattern)
  },
  playThud: async () => {
    const pattern = createThudPattern()
    await processPattern(pattern)
  }
} as Haptics

export type HapticsContextValues = Haptics & {
  isFeedbackSupportedOnDevice: boolean;
  isAudioSupportedOnDevice: boolean;
};

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
  haptics: Haptics;
  isFeedbackSupportedOnDevice: boolean;
  isAudioSupportedOnDevice: boolean;
  children: ReactNode;
};

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
      ...haptics,
      isFeedbackSupportedOnDevice,
      isAudioSupportedOnDevice
    }}
  >
    {children}
  </HapticsContext.Provider>
)
