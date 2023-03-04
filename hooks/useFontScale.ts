import { useWindowDimensions } from "react-native"

export type UseFontScaleProps = {
  maximumScaleFactor?: number
}

/**
 * Returns the current font settings on the user's device.
 *
 * Use this when you need to scale an icon or some other UI element
 * based on the user's font size settings.
 */
export const useFontScale = (props?: UseFontScaleProps) => {
  return Math.min(
    useWindowDimensions().fontScale,
    props?.maximumScaleFactor ?? Number.MAX_VALUE
  )
}
