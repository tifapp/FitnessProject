import * as ExpoHaptics from "expo-haptics"
import { ReactNode, createContext, useContext } from "react"

/**
 * A haptic event to be played to the user.
 */
export interface HapticsFunctions {
  actOnEvent: (hapticTrigger: HapticEvent) => void
}

/**
 * A function type to indicate haptic feedback being played to the user.
 */
export type HapticEvent =
  | "light tap"
  | "medium tap"
  | "heavy tap"
  | "selection"
  | "success"
  | "warning"
  | "error"

const HapticsFunctionsContext = createContext<HapticsFunctions | undefined>(
  undefined
)

export const useHapticsFunctions = () => useContext(HapticsFunctionsContext)!

export type HapticsProviderProps = HapticsFunctions & {
  children: ReactNode
}

export const HapticsFunctionsProvider = ({
  children,
  ...props
}: HapticsProviderProps) => (
  <HapticsFunctionsContext.Provider value={props}>
    {children}
  </HapticsFunctionsContext.Provider>
)

export type PlayHaptics = (event: HapticEvent) => Promise<void>

/**
 * Haptics Player implemented by Expo.
 */
export const expoPlayHaptics = async (event: HapticEvent) => {
  switch (event) {
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
  case "medium tap":
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium)
    break
  case "heavy tap":
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy)
    break
  }
}
