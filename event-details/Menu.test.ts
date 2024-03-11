import { setPlatform } from "@test-helpers/Platform"
import { EVENT_MENU_ACTION, formatEventMenuActions } from "./Menu"
import { EventAttendeeMocks } from "./MockData"
import { CurrentUserEvent } from "@shared-models/Event"

describe("EventDetailsMenu tests", () => {
  describe("FormatEventMenuActions tests", () => {
    afterEach(() => setPlatform("ios"))

    it("should format the contact-host action with the host's name", () => {
      const actions = formatEventMenuActions(
        { host: EventAttendeeMocks.Alivs } as CurrentUserEvent,
        [EVENT_MENU_ACTION.copyEvent, EVENT_MENU_ACTION.contactHost]
      )
      expect(actions).toEqual([
        EVENT_MENU_ACTION.copyEvent,
        { ...EVENT_MENU_ACTION.contactHost, title: "Contact Alvis" }
      ])
    })

    it("should format the toggle-block-host with 'Block Hostname' when user is not blocking host", () => {
      const actions = formatEventMenuActions(
        { host: EventAttendeeMocks.Alivs } as CurrentUserEvent,
        [EVENT_MENU_ACTION.toggleBlockHost]
      )
      expect(actions).toEqual([
        {
          ...EVENT_MENU_ACTION.toggleBlockHost,
          title: "Block Alvis",
          image: "person.slash.fill"
        }
      ])
    })

    it("should format the toggle-block-host with 'Unblock Hostname' when user is blocking host", () => {
      const actions = formatEventMenuActions(
        {
          host: {
            ...EventAttendeeMocks.Alivs,
            relations: { themToYou: "not-friends", youToThem: "blocked" }
          }
        } as CurrentUserEvent,
        [EVENT_MENU_ACTION.toggleBlockHost]
      )
      expect(actions).toEqual([
        {
          ...EVENT_MENU_ACTION.toggleBlockHost,
          title: "Unblock Alvis",
          image: "person.fill.checkmark"
        }
      ])
    })

    it("should reverse the actions if the platform is android", () => {
      setPlatform("android")
      const actions = formatEventMenuActions({} as CurrentUserEvent, [
        EVENT_MENU_ACTION.copyEvent,
        EVENT_MENU_ACTION.shareEvent
      ])
      expect(actions).toEqual([
        EVENT_MENU_ACTION.shareEvent,
        EVENT_MENU_ACTION.copyEvent
      ])
    })
  })
})
