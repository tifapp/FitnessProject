import { useWindowDimensions } from "react-native"

/**
 * Common font scale factor cutoffs somewhat based on iOS's dynamic type sizes.
 *
 * See: https://developer.apple.com/documentation/swiftui/dynamictypesize
 */
export namespace DynamicTypeSizes {
  export const xxxLarge = 1.5
  export const accessibility2 = 2.2
}

export type UseFontScaleProps = {
  /**
   * Upper limits the font scaling factor to this value.
   */
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
