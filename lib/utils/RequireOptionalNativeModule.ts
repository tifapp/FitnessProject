import { requireNativeModule } from "expo-modules-core"

/**
 * A backport of `requireOptionalNativeModule` from a future expo version.
 */
export const requireOptionalNativeModule = <Module = any>(name: string) => {
  try {
    return requireNativeModule<Module>(name)
  } catch {
    return null
  }
}
