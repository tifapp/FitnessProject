import { EVENT_MENU_ACTION, hydrateEventMenuActions } from "./Menu"
import { EventAttendeeMocks } from "./MockData"

describe("EventDetailsMenu tests", () => {
  describe("HydrateEventMenuActions tests", () => {
    it("should hydrate the contact-host action with the host's name", () => {
      const actions = hydrateEventMenuActions(
        { host: EventAttendeeMocks.Alivs },
        [EVENT_MENU_ACTION.copyEvent, EVENT_MENU_ACTION.contactHost]
      )
      expect(actions).toEqual([
        EVENT_MENU_ACTION.copyEvent,
        { ...EVENT_MENU_ACTION.contactHost, title: "Contact Alvis" }
      ])
    })
  })
})
