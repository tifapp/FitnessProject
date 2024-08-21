import { TestAppLaunchConfig } from "../Launch"
import { TestLocations, setUserLocation } from "../Location"

export const beforeLaunch = async (): Promise<TestAppLaunchConfig> => {
  // Perform any setup work in here, (setting location, reseting device
  // permissions, etc.)
  return {}
}

export const setLocationToJohnMcLarenPark = async () => {
  await setUserLocation(TestLocations.JohnMcLarenPark)
}

export const havePaulCreateTheEventoutdoorDanceLessonInJohnMclarenParkNextSundayAt800Am = async () => {
  // Paul creates outdoor dance lesson event in John McLaren Park next Sunday morning.
  throw new Error("TODO")
}

export const haveLauraJoinTheoutdoorDanceLessonEvent = async () => {
  // Laura joins Paul's outdoor dance lesson event before it starts.
  throw new Error("TODO")
}

export const havePaulUpdateTheTimeAndLocationOfTheoutdoorDanceLessonEventToBeInCayugaParkOnMondayAt1200Pm = async () => {
  // Paul updates the time and location of the event to take place in Cayuga Park on Monday at noon.
  throw new Error("TODO")
}

export const verifyThatLauraWasNotifiedThatoutdoorDanceLessonWasUpdated = async () => {
  // Laura is notified that the time and location of the event have changed.
  throw new Error("TODO")
}

export const verifyThatLauraCanViewTheUpdatedEventDetailsFromTheNotification = async () => {
  // Laura views the updated event.
  throw new Error("TODO")
}
