import { osVersion } from "expo-device"

export const isOSMajorVersionAvailable = (version: number) => {
  return !!osMajorVersion && osMajorVersion >= version
}

export const osMajorVersion = osVersion ? parseInt(osVersion) : undefined
