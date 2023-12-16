import React, { ReactNode, createContext, useContext, useEffect } from "react"
import { TiFNativeHaptics, TiFNativeHapticEvent } from "@modules/tif-haptics"
import { createLogFunction } from "./Logging"
import { useAtom } from "jotai"
import { JotaiUtils } from "./utils/Jotai"

export const IS_HAPTICS_MUTED_KEY = "@haptics_is_muted"

const isHapticsMutedAtom = JotaiUtils.atomWithAsyncStorage(
  IS_HAPTICS_MUTED_KEY,
  false
)

export const IS_HAPTICS_SUPPORTED_ON_DEVICE =
  !!TiFNativeHaptics.IS_HAPTICS_SUPPORTED

/**
 * A function type to indicate haptic feedback being played to the user.
 */
export type HapticEvent = { name: "selection" }

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
   * Mutes haptics if unmuted.
   */
  mute(): void

  /**
   * Unmutes haptics if muted.
   */
  unmute(): void
}

const log = createLogFunction("tif.haptics")

/**
 * The default {@link Haptics} implementation which persists the mute state in async storage,
 * and uses CoreHaptics on iOS and Vibrator on Android.
 */
export const TiFHaptics = {
  ...TiFNativeHaptics,
  play: async (event: HapticEvent) => {
    try {
      await TiFNativeHaptics.play(toNativeHapticEvent(event))
    } catch (error) {
      log("warn", "An error occurred when playing haptics", {
        error: error.message
      })
    }
  }
} as Haptics

export type HapticsContextValues = Haptics & { isSupportedOnDevice: boolean }

const HapticsContext = createContext<HapticsContextValues | undefined>(
  undefined
)

/**
 * The current {@link Haptics} implementation provided by {@link HapticsProvider}.
 */
export const useHaptics = () => {
  const [isMuted, setIsMuted] = useAtom(isHapticsMutedAtom)
  const hapticsContext = useContext(HapticsContext)!

  useEffect(() => {
    if (isMuted) {
      hapticsContext.mute()
    } else {
      hapticsContext.unmute()
    }
  }, [isMuted, hapticsContext])

  return {
    ...hapticsContext,
    isMuted,
    mute: () => setIsMuted(true),
    unmute: () => setIsMuted(false)
  }
}

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
      play: async (event) => await haptics.play(event),
      mute: () => haptics.mute(),
      unmute: () => haptics.unmute(),
      isSupportedOnDevice
    }}
  >
    {children}
  </HapticsContext.Provider>
)
