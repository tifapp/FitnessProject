import { TestAppLaunchConfig } from "../Launch"

export const beforeLaunch = async (): Promise<TestAppLaunchConfig> => {
  // Perform any setup work in here, (setting location, reseting device
  // permissions, etc.)
  return {}
}

export const ensureJustinHasSignedIntoHisAccount = async () => {
  // Justin is signed in
  throw new Error("TODO")
}

export const searchForEventsInFresnoAndGoToTheDetailsForTheNearestOne =
  async () => {
    // Justin wants to find the nearest event in Fresno
    throw new Error("TODO")
  }

export const haveJustinJoinTheEvent = async () => {
  // After finding an event, Justin wants to join it
  throw new Error("TODO")
}

export const haveJustinLeaveTheEvent = async () => {
  // After some pondering, Justin decides that he is not interested in the event and wants to leave
  throw new Error("TODO")
}

export const ensureThatJustinHasLeftTheEventSuccessfully = async () => {
  // Justin has now left the event
  throw new Error("TODO")
}
