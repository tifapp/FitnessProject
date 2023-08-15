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
 * Interface that provides structures for functions for:
 *
 * - How to play haptics
 * - How to mute/unmute the activation of haptics
 */
export interface Haptics {
  play(event: HapticEvent): Promise<void>
  mute(): void
  unmute(): void
}

export class PersistentHaptics implements Haptics {
  private readonly playEvent: (event: HapticEvent) => Promise<void>

  /**
   * Assigns the function callback that occurs when a HapticEvent is given.
   * @param playEvent
   */
  constructor (
    playEvent: (event: HapticEvent) => Promise<void> = expoPlayHaptics
  ) {
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

  /**
   * Sets the haptics muted key to "true", enabling haptics for use.
   */
  mute () {
    AsyncStorage.setItem(IS_HAPTICS_MUTED_KEY, "true")
  }

  /**
   * Removes the haptics muted key, disabling haptics for use.
   */
  unmute () {
    AsyncStorage.removeItem(IS_HAPTICS_MUTED_KEY)
  }
}

const HapticsContext = createContext<Haptics | undefined>(undefined)

export const useHaptics = () => useContext(HapticsContext)!

export type HapticsProviderProps = {
  children: ReactNode
  haptics: Haptics
}

/**
 * Provider for {@link Haptics}
 */
export const HapticsProvider = ({
  children,
  haptics
}: HapticsProviderProps) => (
  <HapticsContext.Provider value={haptics}>{children}</HapticsContext.Provider>
)

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
