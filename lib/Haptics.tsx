import * as ExpoHaptics from "expo-haptics"
import { ReactNode, createContext, useContext } from "react"
import { HapticsManager } from "./HapticsManager"

/**
 * A haptic event to be played to the user.
 */
export interface HapticsFunctions {
  play: (hapticTrigger: HapticEvent) => Promise<void>
  mute: () => void
  unmute: () => void
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

const HapticsManagerContext = createContext<HapticsManager | undefined>(
  undefined
)

export const useHapticsFunctions = () => useContext(HapticsManagerContext)!

export type HapticsProviderProps = HapticsManager & {
  children: ReactNode
}

export const HapticsManagerProvider = ({
  children,
  ...props
}: HapticsProviderProps) => (
  <HapticsManagerContext.Provider value={props}>
    {children}
  </HapticsManagerContext.Provider>
)

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
