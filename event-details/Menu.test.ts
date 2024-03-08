import { setPlatform } from "@test-helpers/Platform"
import { EVENT_MENU_ACTION, formatEventMenuActions } from "./Menu"
import { EventAttendeeMocks } from "./MockData"

describe("EventDetailsMenu tests", () => {
  describe("FormatEventMenuActions tests", () => {
    afterEach(() => setPlatform("ios"))

    it("should format the contact-host action with the host's name", () => {
      const actions = formatEventMenuActions(
        { host: EventAttendeeMocks.Alivs },
        [EVENT_MENU_ACTION.copyEvent, EVENT_MENU_ACTION.contactHost]
      )
      expect(actions).toEqual([
        EVENT_MENU_ACTION.copyEvent,
        { ...EVENT_MENU_ACTION.contactHost, title: "Contact Alvis" }
      ])
    })

    it("should reverse the actions if the platform is android", () => {
      setPlatform("android")
      const actions = formatEventMenuActions(
        { host: EventAttendeeMocks.Alivs },
        [EVENT_MENU_ACTION.copyEvent, EVENT_MENU_ACTION.editEvent]
      )
      expect(actions).toEqual([
        EVENT_MENU_ACTION.editEvent,
        EVENT_MENU_ACTION.copyEvent
      ])
    })
  })
})
