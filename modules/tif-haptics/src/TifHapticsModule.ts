import { createLogFunction } from "@lib/Logging"
import { requireNativeModule } from "expo-modules-core"

export enum TiFNativeHapticEvent {
  Selection = "selection"
}

const log = createLogFunction("native.module")

const resolveNativeModule = <Module = any>(name: string) => {
  try {
    return requireNativeModule<Module>(name)
  } catch (error) {
    log("error", `Native module ${name} failed to load.`, { error })
    return {}
  }
}

export const TiFNativeHaptics = resolveNativeModule("TifHaptics")
