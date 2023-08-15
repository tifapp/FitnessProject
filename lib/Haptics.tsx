import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ExpoHaptics from "expo-haptics"
import { atomWithStorage } from "jotai/utils"
import React, { ReactNode, createContext, useContext } from "react"

export const IS_HAPTICS_MUTED_KEY = "@haptics_is_muted"

export const isHapticsMutedAtom = atomWithStorage(IS_HAPTICS_MUTED_KEY, false)

/**
 * A function type to indicate haptic feedback being played to the user.
 */
export type HapticEvent = { name: "selection" }

/**
 * Haptics Player implemented by Expo.
 */
export const expoPlayHaptics = async (event: HapticEvent) => {
  switch (event.name) {
  case "selection":
    await ExpoHaptics.selectionAsync()
    break
  }
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

/**
 * A {@link Haptics} implementation that persists the mute state to {@link AsyncStorage}.
 */
export class PersistentHaptics implements Haptics {
  static shared = new PersistentHaptics(expoPlayHaptics)

  private readonly playEvent: (event: HapticEvent) => Promise<void>

  constructor (playEvent: (event: HapticEvent) => Promise<void>) {
    this.playEvent = playEvent
  }

  /**
   * Function that uses the class's current playEvent function callback.
   * Checks whether or not haptics are muted before trying.
   * @param event - the callback's parameter.
   */
  async play (event: HapticEvent) {
    const isMuted = await AsyncStorage.getItem(IS_HAPTICS_MUTED_KEY)
    if (!isMuted) {
      await this.playEvent(event)
    }
  }

  mute () {
    AsyncStorage.setItem(IS_HAPTICS_MUTED_KEY, "true")
  }

  unmute () {
    AsyncStorage.removeItem(IS_HAPTICS_MUTED_KEY)
  }
}

const HapticsContext = createContext<Haptics | undefined>(undefined)

/**
 * The current {@link Haptics} implementation provided by {@link HapticsProvider}.
 */
export const useHaptics = () => useContext(HapticsContext)!

export type HapticsProviderProps = {
  children: ReactNode
  haptics: Haptics
}

/**
 * Provider for {@link Haptics}.
 */
export const HapticsProvider = ({
  children,
  haptics
}: HapticsProviderProps) => (
  <HapticsContext.Provider value={haptics}>{children}</HapticsContext.Provider>
)
