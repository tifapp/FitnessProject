import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ExpoHaptics from "expo-haptics"
import { atomWithStorage } from "jotai/utils"
import { ReactNode, createContext, useContext } from "react"

/**
 * A haptic event to be played to the user.
 */

export const isHapticsMutedAtom = atomWithStorage("@haptics_is_muted", false)

export class ExpoHapticsImplementation implements Haptics {
  async play (hapticsTrigger: HapticEvent) {
    const areHapticsOn = await AsyncStorage.getItem("@haptics_is_muted")
    if (areHapticsOn) {
      expoPlayHaptics(hapticsTrigger)
    }
  }

  mute () {
    AsyncStorage.setItem("@haptics_is_muted", "false")
  }

  unmute () {
    AsyncStorage.setItem("@haptics_is_muted", "true")
  }
}

export interface Haptics {
  play(hapticsTrigger: HapticEvent): Promise<void>
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
