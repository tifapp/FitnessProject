import { useSafeAreaInsets } from "react-native-safe-area-context"

/**
 * Returns the given padding values depending on whether or not the device
 * has a bottom safe area.
 */
export const useScreenBottomPadding = (values: {
  safeAreaScreens: number
  nonSafeAreaScreens: number
}) => {
  return useSafeAreaInsets().bottom === 0
    ? values.nonSafeAreaScreens
    : values.safeAreaScreens
}
