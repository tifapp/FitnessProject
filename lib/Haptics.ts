import * as ExpoHaptics from "expo-haptics"
import { createDependencyKey } from "./dependencies"

/**
 * A haptic event to be played to the user.
 */
export enum HapticEvent {
  /**
   * Useful for when the user changes a selected ui element in a form.
   */
  SelectionChanged,

  /**
   * Useful for when something positive happens after a user action (eg. Event created).
   */
  Success,

  /**
   * Useful for warning the user of some incoming notification or event.
   */
  Warning,

  /**
   * Useful for alerting the user that they made a mistake, or if an error occurred as a result
   * of a user initiated action.
   */
  Error,

  /**
   * Useful for minor cases which involve a simple button tap.
   */
  LightTap,

  /**
   * Useful for minor cases which involve a simple button tap, but with more emphasis over a light tap.
   */
  MediumTap,

  /**
   * Useful for minor cases which involve a simple button tap, but with more emphasis over a medium tap.
   */
  HeavyTap
}

/**
 * A function type to indicate haptic feedback being played to the user.
 */
export type PlayHaptics = (event: HapticEvent) => Promise<void>

/**
 * Haptics Player implemented by Expo.
 */
export const expoPlayHaptics = async (event: HapticEvent) => {
  switch (event) {
  case HapticEvent.SelectionChanged:
    await ExpoHaptics.selectionAsync()
    break
  case HapticEvent.Success:
    await ExpoHaptics.notificationAsync(
      ExpoHaptics.NotificationFeedbackType.Success
    )
    break
  case HapticEvent.Warning:
    await ExpoHaptics.notificationAsync(
      ExpoHaptics.NotificationFeedbackType.Warning
    )
    break
  case HapticEvent.Error:
    await ExpoHaptics.notificationAsync(
      ExpoHaptics.NotificationFeedbackType.Error
    )
    break
  case HapticEvent.LightTap:
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light)
    break
  case HapticEvent.MediumTap:
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium)
    break
  case HapticEvent.HeavyTap:
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy)
    break
  }
}

/**
 * A `DependencyKey` for playing haptics.
 *
 * The default value simply uses [`expo-haptics`](https://docs.expo.dev/versions/latest/sdk/haptics/)
 * which uses `UIFeedbackGenerator` for iOS and `Vibrator` for Android.
 */
export const hapticsDependencyKey = createDependencyKey<PlayHaptics>(
  () => expoPlayHaptics
)
