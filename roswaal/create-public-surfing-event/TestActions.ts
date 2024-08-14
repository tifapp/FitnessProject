import { TestAppLaunchConfig } from "../Launch"

export const beforeLaunch = async (): Promise<TestAppLaunchConfig> => {
  // Perform any setup work in here, (setting location, reseting device
  // permissions, etc.)
  return {}
}

export const haveBillCreateTheSurfingCompetitionEventAtSantaCruzBoardwalkBeachNextFridayAt300Pm = async () => {
  // Bill creates surfing competition event at Santa Cruz Boardwalk Beach next Friday afternoon.
  throw new Error("TODO")
}

export const verifyThatBillCanViewTheDetailsOfThesurfingCompetitionEvent = async () => {
  // Bill views his event to ensure the details are correct.
  throw new Error("TODO")
}

export const verifyThatJaneCanViewTheDetailsOfThesurfingCompetitionEvent = async () => {
  // Jane views Bill's event and considers joining.
  throw new Error("TODO")
}
