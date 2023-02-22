import { Platform } from "react-native"

/**
 * Sets the platform for the duration of a test.
 */
export const setPlatform = (platform: "ios" | "android") => {
  Platform.OS = platform
}
