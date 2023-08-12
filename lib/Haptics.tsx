import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ExpoHaptics from "expo-haptics"
import { atomWithStorage } from "jotai/utils"
import { ReactNode, createContext, useContext } from "react"

/**
 * A haptic event to be played to the user.
 */

export const isHapticsMutedAtom = atomWithStorage("@haptics_is_muted", false)

export const IS_HAPTICS_MUTED_KEY = "@haptics_is_muted"

export class PersistentHaptics implements Haptics {
  private readonly playEvent: (event: HapticEvent) => Promise<void>

  constructor (
    playEvent: (event: HapticEvent) => Promise<void> = expoPlayHaptics
  ) {
    this.playEvent = playEvent
  }

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

export interface Haptics {
  play(event: HapticEvent): Promise<void>
  mute(): void
  unmute(): void
}

/**
 * A function type to indicate haptic feedback being played to the user.
 */
export type HapticEvent = { name: "selection" }

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
