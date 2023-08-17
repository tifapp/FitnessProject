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
    // NB: - Yes node... I know it doesn't load in tests...
    if (process.env.JEST_WORKER_ID) return {}
    log("error", `Native module ${name} failed to load.`, {
      error,
      message: error.message
    })
    return {}
  }
}

export const TiFNativeHaptics = resolveNativeModule("TifHaptics")
