import { Platform } from "react-native"

/**
 * Sets the platform for the duration of a test.
 */
export const setPlatform = (platform: typeof Platform.OS) => {
  Platform.OS = platform
}
