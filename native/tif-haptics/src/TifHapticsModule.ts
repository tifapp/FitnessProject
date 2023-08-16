import { requireNativeModule } from "expo-modules-core"

export enum TiFNativeHapticEvent {
  Selection = "selection"
}

const resolveNativeModule = <Module = any>(name: string) => {
  try {
    return requireNativeModule<Module>(name)
  } catch {
    return {}
  }
}

export const TiFNativeHaptics = resolveNativeModule("TifHaptics")
