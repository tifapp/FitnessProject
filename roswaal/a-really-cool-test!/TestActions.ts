import { TestAppLaunchConfig } from "../Launch"

export const beforeLaunch = async (): Promise<TestAppLaunchConfig> => {
  // Perform any setup work in here, (setting location, reseting device
  // permissions, etc.)
  return {}
}

export const nameTheUserBlob = async () => {
  // He is named Blob
  throw new Error("TODO")
}

export const makeBlob10YearsOld = async () => {
  // Blob is 10
  throw new Error("TODO")
}
