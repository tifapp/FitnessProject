import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ExpoHaptics from "expo-haptics"
import { atomWithStorage } from "jotai/utils"
import { ReactNode, createContext, useContext } from "react"

/**
 * A haptic event to be played to the user.
 */

export const hapticsEnabledIndicator = atomWithStorage("haptics on/off", true)

export class ExpoHapticsImplementation implements HapticsFunctions {
  async play (hapticsTrigger: HapticEvent) {
    const areHapticsOn = await AsyncStorage.getItem("haptics on/off")
    if (areHapticsOn) {
      expoPlayHaptics(hapticsTrigger)
    }
  }

  async mute () {
    await AsyncStorage.setItem("haptics on/off", "false")
  }

  async unmute () {
    await AsyncStorage.setItem("haptics on/off", "true")
  }
}

export interface HapticsFunctions {
  play(hapticsTrigger: HapticEvent): Promise<void>
  mute(): Promise<void>
  unmute(): Promise<void>
}

/**
 * A function type to indicate haptic feedback being played to the user.
 */
export type HapticEvent =
  | { hapticsInteraction: "light tap" }
  | { hapticsInteraction: "selection" }
  | { hapticsInteraction: "success" }
  | { hapticsInteraction: "warning" }
  | { hapticsInteraction: "error" }

const ExpoHapticsImplementationContext = createContext<
  ExpoHapticsImplementation | undefined
>(undefined)

export const useHapticsFunctions = () =>
  useContext(ExpoHapticsImplementationContext)!

export type HapticsProviderProps = {
  children: ReactNode
  haptics: ExpoHapticsImplementation
}
/**
 * Provider for ExpoHapticsImplementation.
 *
 */
export const ExpoHapticsImplementationProvider = ({
  children,
  haptics,
  ...props
}: HapticsProviderProps) => (
  <ExpoHapticsImplementationContext.Provider value={haptics}>
    {children}
  </ExpoHapticsImplementationContext.Provider>
)

/**
 * Haptics Player implemented by Expo.
 */
export const expoPlayHaptics = async (event: HapticEvent) => {
  switch (event.hapticsInteraction) {
  case "selection":
    await ExpoHaptics.selectionAsync()
    break
  case "success":
    await ExpoHaptics.notificationAsync(
      ExpoHaptics.NotificationFeedbackType.Success
    )
    break
  case "warning":
    await ExpoHaptics.notificationAsync(
      ExpoHaptics.NotificationFeedbackType.Warning
    )
    break
  case "error":
    await ExpoHaptics.notificationAsync(
      ExpoHaptics.NotificationFeedbackType.Error
    )
    break
  case "light tap":
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light)
    break
  }
}
