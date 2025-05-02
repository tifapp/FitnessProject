import {
  AnimatableValue,
  AnimationCallback,
  Layout,
  withSpring
} from "react-native-reanimated"

/**
 * The default layout transition to use whe working with reanimated.
 */
export const TiFDefaultLayoutTransition = Layout.springify().damping(14)

export const withTiFDefaultSpring = <T extends AnimatableValue>(
  value: T,
  callback?: AnimationCallback
) => {
  "worklet"
  return withSpring(value, { damping: 14 }, callback)
}
