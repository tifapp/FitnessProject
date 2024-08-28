import { Layout, withSpring, AnimatableValue } from "react-native-reanimated"

/**
 * The default layout transition to use whe working with reanimated.
 */
export const TiFDefaultLayoutTransition = Layout.springify().damping(14)

export const withTiFDefaultSpring = <T extends AnimatableValue>(value: T) => {
  "worklet"
  return withSpring(value, { damping: 14 })
}
