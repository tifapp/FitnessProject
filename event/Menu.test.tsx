import { ClientSideEvent } from "@event/ClientSideEvent"
import { uuidString } from "TiFShared/lib/UUID"
import { setPlatform } from "@test-helpers/Platform"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { fakeTimers } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { EmailAddress } from "@user/privacy"
import { UserSessionProvider } from "@user/Session"
import { UnblockedUserRelationsStatus } from "TiFShared/domain-models/User"
import { UseLoadEventDetailsResult } from "@event-details-boundary/Details"
import {
  EVENT_MENU_ACTION,
  formatEventMenuActions,
  useEventActionsMenu
} from "./Menu"
import {
  EventAttendeeMocks,
  EventMocks
} from "@event-details-boundary/MockData"
import { renderSuccessfulUseLoadEventDetails } from "@event-details-boundary/TestHelpers"
import { UserBlockingFeature } from "@user/Blocking"

describe("EventDetailsMenu tests", () => {
  describe("FormatEventMenuActions tests", () => {
    afterEach(() => setPlatform("ios"))

    it("should format the contact-host action with the host's name", () => {
      const actions = formatEventMenuActions(
        { host: EventAttendeeMocks.Alivs } as unknown as ClientSideEvent,
        [EVENT_MENU_ACTION.copyEvent, EVENT_MENU_ACTION.contactHost]
      )
      expect(actions).toEqual([
        EVENT_MENU_ACTION.copyEvent,
        { ...EVENT_MENU_ACTION.contactHost, title: "Contact Alvis" }
      ])
    })

    it("should format the toggle-block-host with 'Block Hostname' when user is not blocking host", () => {
      const actions = formatEventMenuActions(
        { host: EventAttendeeMocks.Alivs } as unknown as ClientSideEvent,
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
            relationStatus: "blocked-them"
          }
        } as unknown as ClientSideEvent,
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
      const actions = formatEventMenuActions({} as ClientSideEvent, [
        EVENT_MENU_ACTION.copyEvent,
        EVENT_MENU_ACTION.shareEvent
      ])
      expect(actions).toEqual([
        EVENT_MENU_ACTION.shareEvent,
        EVENT_MENU_ACTION.copyEvent
      ])
    })
  })

  describe("UseEventMenuActions tests", () => {
    const queryClient = createTestQueryClient()
    const userSession = jest.fn()
    const blockHost = jest.fn()
    const unblockHost = jest.fn()

    fakeTimers()
    beforeEach(() => {
      jest.resetAllMocks()
      queryClient.clear()
    })

    const TEST_EVENT = EventMocks.PickupBasketball

    const TEST_USER_SESSION = {
      id: uuidString(),
      primaryContactInfo: EmailAddress.peacock69
    }

    it("should use the non-signed in actions when the user isn't signed in", async () => {
      userSession.mockRejectedValueOnce(new Error())
      const { result } = renderUseEventDetailsMenuActions(TEST_EVENT)
      await waitFor(() => {
        expect(result.current.actionsListKey).toEqual("not-signed-in")
      })
    })

    it("should use the user attendee status for the actions key when the user is signed in", async () => {
      ensureUserIsSignedIn()
      const { result } = renderUseEventDetailsMenuActions({
        ...TEST_EVENT,
        userAttendeeStatus: "attending"
      })
      await waitFor(() => {
        expect(result.current.actionsListKey).toEqual("attending")
      })
    })

    test("successful block host flow, updates event details hook", async () => {
      ensureUserIsSignedIn()
      const event = testEventWithRelations("friends")
      const { result: eventDetailsResult } = renderUseEventDetails(event)
      const { result: eventMenuActionsResult } =
        renderUseEventDetailsMenuActions(event)
      await waitForDetailsRelations(eventDetailsResult, "friends")
      act(() => eventMenuActionsResult.current.blockHostToggled())
      await waitForDetailsRelations(eventDetailsResult, "blocked-them")
      await waitFor(() => expect(blockHost).toHaveBeenCalledWith(event.host.id))
    })

    test("successful unblock host flow, updates event details hook", async () => {
      ensureUserIsSignedIn()
      const event = testEventWithRelations("blocked-them")
      const { result: eventDetailsResult } = renderUseEventDetails(event)
      const { result: eventMenuActionsResult } =
        renderUseEventDetailsMenuActions(event)
      await waitForDetailsRelations(eventDetailsResult, "blocked-them")
      act(() => eventMenuActionsResult.current.blockHostToggled())
      await waitForDetailsRelations(eventDetailsResult, "not-friends")
      await waitFor(() => {
        expect(unblockHost).toHaveBeenCalledWith(event.host.id)
      })
    })

    test("unsuccessful block flow, reverts details hook result", async () => {
      blockHost.mockImplementationOnce(async () => {
        await Promise.reject(new Error())
      })
      ensureUserIsSignedIn()
      const event = testEventWithRelations("friends")
      const { result: eventDetailsResult } = renderUseEventDetails(event)
      const { result: eventMenuActionsResult } =
        renderUseEventDetailsMenuActions(event)
      await waitForDetailsRelations(eventDetailsResult, "friends")
      expect(eventMenuActionsResult.current.isToggleBlockHostError).toEqual(
        false
      )
      act(() => eventMenuActionsResult.current.blockHostToggled())
      await waitForDetailsRelations(eventDetailsResult, "blocked-them")
      await waitFor(() => {
        expect(eventMenuActionsResult.current.isToggleBlockHostError).toEqual(
          true
        )
      })
      await waitForDetailsRelations(eventDetailsResult, "friends")
    })

    const ensureUserIsSignedIn = () => {
      userSession.mockResolvedValueOnce(TEST_USER_SESSION)
    }

    const testEventWithRelations = (
      relationStatus: UnblockedUserRelationsStatus
    ) => ({
      ...TEST_EVENT,
      host: {
        ...TEST_EVENT.host,
        relationStatus
      }
    })

    const waitForDetailsRelations = async (
      result: { current: UseLoadEventDetailsResult },
      relationStatus: UnblockedUserRelationsStatus
    ) => {
      await waitFor(() => {
        expect(result.current).toMatchObject({
          event: {
            host: {
              relationStatus
            }
          }
        })
      })
    }

    const renderUseEventDetails = (event: ClientSideEvent) => {
      return renderSuccessfulUseLoadEventDetails(event, queryClient)
    }

    const renderUseEventDetailsMenuActions = (event: ClientSideEvent) => {
      return renderHook(() => useEventActionsMenu(event), {
        wrapper: ({ children }: any) => (
          <TestQueryClientProvider client={queryClient}>
            <UserBlockingFeature.Provider
              blockUser={blockHost}
              unblockUser={unblockHost}
            >
              <UserSessionProvider userSession={userSession}>
                {children}
              </UserSessionProvider>
            </UserBlockingFeature.Provider>
          </TestQueryClientProvider>
        )
      })
    }
  })
})
