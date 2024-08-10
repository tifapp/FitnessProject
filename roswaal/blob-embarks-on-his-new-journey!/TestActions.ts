import { TestAppLaunchConfig } from "../Launch"

export const beforeLaunch = async (): Promise<TestAppLaunchConfig> => {
  // Perform any setup work in here, (setting location, reseting device
  // permissions, etc.)
  return {}
}

export const makeTheTravelersNameBlob = async () => {
  // His name is Blob
  throw new Error("TODO")
}

export const makeBlob20YearsOld = async () => {
  // Blob is 20
  throw new Error("TODO")
}

export const verifyThatBlobCanStartHisJourney! = async () => {
  // Blob is ready to embark!
  throw new Error("TODO")
}
