import { requireOptionalNativeModule } from "expo"
import { ReactNode, createContext, useContext } from "react"
import { DeviceSettings, DeviceSettingsStore } from "@lib/DeviceSettings"
import { logger } from "TiFShared/logging"

enum TiFNativeHapticEvent {
  Selection = "selection"
}

const TiFNativeHaptics = requireOptionalNativeModule("TifHaptics") ?? {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  IS_HAPTICS_SUPPORTED: false
}

const log = logger("tif.haptics")

/**
 * A function type to indicate haptic feedback being played to the user.
 */
export type HapticEvent = { name: "selection" }

/**
 * Configuration settings for the underlying haptics engine.
 */
export type HapticsSettings = Pick<
  DeviceSettings,
  "isHapticFeedbackEnabled" | "isHapticAudioEnabled"
>

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
  play(event: HapticEvent): Promise<void>

  /**
   * Applies the settings to this underlying haptics engine.
   */
  apply(settings: HapticsSettings): Promise<void>
}

/**
 * Subscribes to the given {@link DeviceSettingsStore} and applies haptic
 * related settings changes to the given {@link Haptics} instance.
 */
export const applyHapticDeviceSettingsChanges = (
  haptics: Haptics,
  deviceSettingsStore: DeviceSettingsStore
) => {
  deviceSettingsStore.subscribe((settings) => haptics.apply(settings))
}

/**
 * The default {@link Haptics} implementation which persists the mute state in async storage,
 * and uses CoreHaptics on iOS and Vibrator on Android.
 */
export const TiFHaptics = {
  play: async (event: HapticEvent) => {
    try {
      await TiFNativeHaptics.play(toNativeHapticEvent(event))
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
  isSupportedOnDevice: boolean
}

const HapticsContext = createContext<HapticsContextValues>({
  ...TiFHaptics,
  isSupportedOnDevice: !!TiFNativeHaptics.IS_HAPTICS_SUPPORTED
})

/**
 * The current {@link Haptics} implementation provided by {@link HapticsProvider}.
 */
export const useHaptics = () => useContext(HapticsContext)

export type HapticsProviderProps = {
  haptics: Haptics
  isSupportedOnDevice: boolean
  children: ReactNode
}

/**
 * Provider for {@link Haptics}.
 */
export const HapticsProvider = ({
  children,
  haptics,
  isSupportedOnDevice
}: HapticsProviderProps) => (
  <HapticsContext.Provider
    value={{
      play: (event) => haptics.play(event),
      apply: (settings) => haptics.apply(settings),
      isSupportedOnDevice
    }}
  >
    {children}
  </HapticsContext.Provider>
)
