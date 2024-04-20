// "Generated" by Roswaal, do not touch.
import { launchApp } from "../Launch"
import {
  beforeLaunch,
  attemptToMakeJohnnyJoinTheEvent,
  ensureJohnnyHasSignedIntoHisAccount,
  ensureJohnnysLocationIsInTheBayArea,
  ensureThatJohnnyJoinedTheEventSuccessfully,
  ensureTheDetailsMatchTheNearestEventInTheBayArea,
  searchForEventsInTheBayAreaAndGoToTheDetailsForTheNearestOne
} from "./TestActions"

test("BasicJoinEventThroughExploration", async () => {
  await launchApp(await beforeLaunch())
  // Johnny is signed in
  await ensureJohnnyHasSignedIntoHisAccount()
  // Johnny lives in the Bay Area
  await ensureJohnnysLocationIsInTheBayArea()
  // Johnny wants to find the nearest event in the Bay Area
  await searchForEventsInTheBayAreaAndGoToTheDetailsForTheNearestOne()
  // After finding an event, Johnny wants to scope out its details
  await ensureTheDetailsMatchTheNearestEventInTheBayArea()
  // Since Johnny is interested in the event, he now tries to join it
  await attemptToMakeJohnnyJoinTheEvent()
  // Johnny has now joined the event
  await ensureThatJohnnyJoinedTheEventSuccessfully()
})
