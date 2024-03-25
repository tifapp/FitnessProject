import { requireOptionalNativeModule } from "@lib/utils/RequireOptionalNativeModule"

export enum TiFNativeHapticEvent {
  Selection = "selection"
}

export const TiFNativeHaptics = requireOptionalNativeModule("TifHaptics") ?? {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  IS_HAPTICS_SUPPORTED: false
}
