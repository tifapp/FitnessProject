import AsyncStorage from "@react-native-async-storage/async-storage"
import { atomWithStorage } from "jotai/utils"
import React, { ReactNode, createContext, useContext } from "react"
import { TiFNativeHaptics, TiFNativeHapticEvent } from "@native/tif-haptics"
import { createLogFunction } from "./Logging"

export const IS_HAPTICS_MUTED_KEY = "@haptics_is_muted"

export const isHapticsMutedAtom = atomWithStorage(IS_HAPTICS_MUTED_KEY, false)

export const IS_HAPTICS_SUPPORTED_ON_DEVICE =
  !!TiFNativeHaptics.IS_HAPTICS_SUPPORTED

/**
 * A function type to indicate haptic feedback being played to the user.
 */
export type HapticEvent = { name: "selection" }

export const toNativeHapticEvent = (_: HapticEvent) => {
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

class NativeHaptics implements Haptics {
  private readonly log = createLogFunction("native.haptics")

  async play (event: HapticEvent) {
    try {
      await TiFNativeHaptics.play(toNativeHapticEvent(event))
    } catch (error) {
      this.log("warn", "An error occurred when playing haptics", { error })
    }
  }

  mute () {
    TiFNativeHaptics.mute()
  }

  unmute () {
    TiFNativeHaptics.unmute()
  }
}

/**
 * A {@link Haptics} implementation that persists the mute state to {@link AsyncStorage}.
 */
export class PersistentHaptics<Base extends Haptics> implements Haptics {
  private readonly base: Base

  constructor (base: Base) {
    this.base = base
  }

  async play (event: HapticEvent) {
    const isMuted = await AsyncStorage.getItem(IS_HAPTICS_MUTED_KEY)
    if (!isMuted) {
      await this.base.play(event)
    }
  }

  mute () {
    AsyncStorage.setItem(IS_HAPTICS_MUTED_KEY, "true")
    this.base.mute()
  }

  unmute () {
    AsyncStorage.removeItem(IS_HAPTICS_MUTED_KEY)
    this.base.unmute()
  }
}

/**
 * The default {@link Haptics} implementation which persists the mute state in async storage,
 * and uses CoreHaptics on iOS and Vibrator on Android.
 */
export const TiFHaptics = new PersistentHaptics(new NativeHaptics()) as Haptics

export type HapticsContextValues = Haptics & { isSupportedOnDevice: boolean }

const HapticsContext = createContext<HapticsContextValues | undefined>(
  undefined
)

/**
 * The current {@link Haptics} implementation provided by {@link HapticsProvider}.
 */
export const useHaptics = () => useContext(HapticsContext)!

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
