import { TestAppLaunchConfig } from "../Launch"

export const beforeLaunch = async (): Promise<TestAppLaunchConfig> => {
  // Perform any setup work in here, (setting location, reseting device
  // permissions, etc.)
  return {}
}

export const nameTheUserBlob = async () => {
  // I am Blob
  throw new Error("TODO")
}

export const makeBlob10YearsOld = async () => {
  // I am 10
  throw new Error("TODO")
}

export const verifyThatBlobHasStartedTheJourney! = async () => {
  // I have started!
  throw new Error("TODO")
}
