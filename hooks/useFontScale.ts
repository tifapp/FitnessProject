import { useWindowDimensions } from "react-native"

/**
 * Returns the current font settings on the user's device.
 *
 * Use this when you need to scale an icon or some other UI element
 * based on the user's font size settings.
 */
export const useFontScale = () => useWindowDimensions().fontScale
