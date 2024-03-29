import { useWindowDimensions } from "react-native"
import { useFonts } from "expo-font"

/**
 * Loads all fonts for the app. (Currently just open sans variants).
 *
 * This hook should only need to be called once at the root of the
 * application. Subsequent calls will produce error results.
 */
export const useAppFonts = () => {
  return useFonts({
    OpenSansSemiBold: require("../assets/fonts/OpenSans-SemiBold.ttf"),
    OpenSans: require("../assets/fonts/OpenSans-Regular.ttf"),
    OpenSansBold: require("../assets/fonts/OpenSans-Bold.ttf"),
    OpenDyslexic: require("../assets/fonts/OpenDyslexic3-Regular.ttf"),
    OpenDyslexicBold: require("../assets/fonts/OpenDyslexic3-Bold.ttf")
  })
}

/**
 * Common font scale factor cutoffs somewhat based on iOS's dynamic type sizes.
 *
 * See: https://developer.apple.com/documentation/swiftui/dynamictypesize
 */
export namespace FontScaleFactors {
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
