// "Generated" by Roswaal, do not touch.
import { launchApp } from "../Launch"
import {
  beforeLaunch,
  ensureJustinHasSignedIntoHisAccount,
  ensureThatJustinHasLeftTheEventSuccessfully,
  haveJustinJoinTheEvent,
  haveJustinLeaveTheEvent,
  searchForEventsInFresnoAndGoToTheDetailsForTheNearestOne
} from "./TestActions"

test("BasicLeaveEventThroughExplorationAsAttendee", async () => {
  await launchApp(await beforeLaunch())
  // Justin is signed in
  await ensureJustinHasSignedIntoHisAccount()
  // Justin wants to find the nearest event in Fresno
  await searchForEventsInFresnoAndGoToTheDetailsForTheNearestOne()
  // After finding an event, Justin wants to join it
  await haveJustinJoinTheEvent()
  // After some pondering, Justin decides that he is not interested in the event and wants to leave
  await haveJustinLeaveTheEvent()
  // Justin has now left the event
  await ensureThatJustinHasLeftTheEventSuccessfully()
})
