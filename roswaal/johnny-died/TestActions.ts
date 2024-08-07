import { TestAppLaunchConfig } from "../Launch"

export const beforeLaunch = async (): Promise<TestAppLaunchConfig> => {
  // Perform any setup work in here, (setting location, reseting device
  // permissions, etc.)
  return {}
}

export const sendJohnnyToHell = async () => {
  // Did you know that Johnny Died
  throw new Error("TODO")
}

export const thisWasJustATestOfTheToolJohnnyIsAliveAndWell = async () => {
  // Close this PR
  throw new Error("TODO")
}
