import { TestAppLaunchConfig } from "../Launch"

export const beforeLaunch = async (): Promise<TestAppLaunchConfig> => {
  // Perform any setup work in here, (setting location, reseting device
  // permissions, etc.)
  return {}
}

export const ensureJohnnyHasSignedIntoHisAccount = async () => {
  // Johnny is signed in
  throw new Error("TODO")
}

export const ensureJohnnysLocationIsInTheBayArea = async () => {
  // Johnny lives in the Bay Area
  throw new Error("TODO")
}

export const searchForEventsInTheBayAreaAndGoToTheDetailsForTheNearestOne =
  async () => {
    // Johnny wants to find the nearest event in the Bay Area
    throw new Error("TODO")
  }

export const ensureTheDetailsMatchTheNearestEventInTheBayArea = async () => {
  // After finding an event, Johnny wants to scope out its details
  throw new Error("TODO")
}

export const attemptToMakeJohnnyJoinTheEvent = async () => {
  // Since Johnny is interested in the event, he now tries to join it
  throw new Error("TODO")
}

export const ensureThatJohnnyJoinedTheEventSuccessfully = async () => {
  // Johnny has now joined the event
  throw new Error("TODO")
}
