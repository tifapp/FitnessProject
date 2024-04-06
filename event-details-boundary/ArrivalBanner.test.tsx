import {
  EventArrivalBannerCountdown,
  fomoStatementKey,
  othersStatementKey,
  countdownMessage,
  EventArrivalBannerProps,
  EventArrivalBannerView,
  useIsShowingEventArrivalBanner,
  eventArrivalBannerCountdown
} from "./ArrivalBanner"
import "@test-helpers/Matchers"
import { act, render, renderHook, waitFor } from "@testing-library/react-native"
import dayjs from "dayjs"
import {
  mockEventArrivalGeofencedRegion,
  mockEventRegion
} from "@arrival-tracking/MockData"
import { EventArrivalGeofencedRegion } from "@arrival-tracking/geofencing"
import { EventRegionMonitorUnsubscribe } from "@arrival-tracking/region-monitoring"
import { EventRegion } from "TiFShared/domain-models/Event"

const TWO_AND_A_HALF_DAYS_IN_SECONDS = dayjs.duration(2.5, "days").asSeconds()
const THIRTY_MINUTES_IN_SECONDS = dayjs.duration(30, "minutes").asSeconds()

describe("ArrivalBanner tests", () => {
  describe("ArrivalBannerCountdown tests", () => {
    it("should use seconds to start when start time is under 1 hour", () => {
      const countdown = eventArrivalBannerCountdown(
        dayjs.duration(59, "minutes").asSeconds(),
        "today"
      )
      expect(countdown).toEqual({
        secondsToStart: dayjs.duration(59, "minutes").asSeconds()
      })
    })

    it("should use day when start time is over 1 hour away", () => {
      const countdown = eventArrivalBannerCountdown(
        dayjs.duration(61, "minutes").asSeconds(),
        "today"
      )
      expect(countdown).toEqual({ day: "today" })
    })

    it("should use day when start time indicates tomorrow", () => {
      const countdown = eventArrivalBannerCountdown(
        dayjs.duration(25, "hour").asSeconds(),
        "tomorrow"
      )
      expect(countdown).toEqual({ day: "tomorrow" })
    })

    it("should use seconds to start when no today or tomorrow", () => {
      const countdown = eventArrivalBannerCountdown(
        dayjs.duration(2, "days").asSeconds(),
        null
      )
      expect(countdown).toEqual({
        secondsToStart: dayjs.duration(2, "days").asSeconds()
      })
    })
  })

  describe("ArriavlBannerMessages tests", () => {
    test("fomoStatementKey", () => {
      expectFomoStatementKey({ day: "today" }, "gearUp")
      expectFomoStatementKey({ day: "tomorrow" }, "gearUp")
      expectFomoStatementKey(
        { secondsToStart: TWO_AND_A_HALF_DAYS_IN_SECONDS },
        "gearUp"
      )
      expectFomoStatementKey(
        { secondsToStart: THIRTY_MINUTES_IN_SECONDS },
        "laceUp"
      )
      expectFomoStatementKey({ secondsToStart: 60 }, "spintOver")
      expectFomoStatementKey(
        { secondsToStart: -THIRTY_MINUTES_IN_SECONDS },
        "spintOver"
      )
    })

    const expectFomoStatementKey = (
      countdown: EventArrivalBannerCountdown,
      key: ReturnType<typeof fomoStatementKey>
    ) => {
      expect(fomoStatementKey(countdown, true)).toEqual(key)
      expect(fomoStatementKey(countdown, false)).toEqual("joinNow")
    }

    test("othersStatementKey", () => {
      expectOthersStatementKey({ day: "today" }, true, "empty")
      expectOthersStatementKey({ day: "tomorrow" }, true, "empty")
      expectOthersStatementKey({ day: "today" }, false, "empty")
      expectOthersStatementKey({ day: "tomorrow" }, false, "empty")
      expectOthersStatementKey(
        { secondsToStart: -THIRTY_MINUTES_IN_SECONDS },
        true,
        "othersNotified"
      )
      expectOthersStatementKey(
        { secondsToStart: -THIRTY_MINUTES_IN_SECONDS },
        false,
        "othersEager"
      )
      expectOthersStatementKey(
        { secondsToStart: THIRTY_MINUTES_IN_SECONDS },
        true,
        "othersNotified"
      )
      expectOthersStatementKey(
        { secondsToStart: THIRTY_MINUTES_IN_SECONDS },
        false,
        "othersEager"
      )
      expectOthersStatementKey({ secondsToStart: 60 }, true, "othersNotified")
      expectOthersStatementKey({ secondsToStart: 60 }, false, "othersEager")
      expectOthersStatementKey(
        { secondsToStart: TWO_AND_A_HALF_DAYS_IN_SECONDS },
        true,
        "empty"
      )
      expectOthersStatementKey(
        { secondsToStart: TWO_AND_A_HALF_DAYS_IN_SECONDS },
        false,
        "empty"
      )
    })

    const expectOthersStatementKey = (
      countdown: EventArrivalBannerCountdown,
      canShareArrivalStatus: boolean,
      key: ReturnType<typeof othersStatementKey>
    ) => {
      expect(
        othersStatementKey(countdown, true, canShareArrivalStatus)
      ).toEqual(key)
      expect(
        othersStatementKey(countdown, false, canShareArrivalStatus)
      ).toEqual("empty")
    }

    test("countdownMessage", () => {
      expect(countdownMessage({ day: "today" })).toEqual(
        "This event kicks off today."
      )
      expect(countdownMessage({ day: "tomorrow" })).toEqual(
        "This event kicks off tomorrow."
      )
      expect(
        countdownMessage({ secondsToStart: -THIRTY_MINUTES_IN_SECONDS })
      ).toEqual("This event is underway.")
      expect(countdownMessage({ secondsToStart: 0 })).toEqual(
        "This event is underway."
      )
      expect(countdownMessage({ secondsToStart: 60 })).toEqual(
        "This event kicks off in under 10 minutes."
      )
      expect(
        countdownMessage({ secondsToStart: THIRTY_MINUTES_IN_SECONDS })
      ).toEqual("This event kicks off in under an hour.")
      expect(
        countdownMessage({ secondsToStart: TWO_AND_A_HALF_DAYS_IN_SECONDS })
      ).toEqual("This event kicks off in 3 days.")
      expect(
        countdownMessage({
          secondsToStart: dayjs.duration(1, "week").asSeconds()
        })
      ).toEqual("This event kicks off in a week.")
      expect(
        countdownMessage({
          secondsToStart: dayjs.duration(3, "weeks").asSeconds()
        })
      ).toEqual("This event kicks off in 3 weeks.")
      expect(
        countdownMessage({
          secondsToStart: dayjs.duration(1.5, "weeks").asSeconds()
        })
      ).toEqual("This event kicks off in 2 weeks.")
      expect(
        countdownMessage({
          secondsToStart: dayjs.duration(1, "month").asSeconds()
        })
      ).toEqual("This event kicks off in a month.")
      expect(
        countdownMessage({
          secondsToStart: dayjs.duration(6.5, "month").asSeconds()
        })
      ).toEqual("This event kicks off in 7 months.")
      expect(
        countdownMessage({
          secondsToStart: dayjs.duration(3, "month").asSeconds()
        })
      ).toEqual("This event kicks off in 3 months.")
    })
  })

  describe("ArrivalBannerView tests", () => {
    test("user has joined title", () => {
      expectEventArrivalBannerText(
        {
          hasJoinedEvent: true,
          countdown: { secondsToStart: 50 },
          canShareArrivalStatus: true
        },
        "Welcome!"
      )
    })

    test("user has not joined title", () => {
      expectEventArrivalBannerText(
        {
          hasJoinedEvent: false,
          countdown: { secondsToStart: 50 },
          canShareArrivalStatus: true
        },
        "Join Now!"
      )
    })

    test("full message, user has joined event, can share arrival status", () => {
      expectEventArrivalBannerText(
        {
          hasJoinedEvent: true,
          countdown: { secondsToStart: 60 },
          canShareArrivalStatus: true
        },
        "This event kicks off in under 10 minutes. Others have been notified of your arrival. Sprint over to the meeting point!"
      )
    })

    test("full message, user has joined event, cannot share arrival status", () => {
      expectEventArrivalBannerText(
        {
          hasJoinedEvent: true,
          countdown: { secondsToStart: 60 },
          canShareArrivalStatus: false
        },
        "This event kicks off in under 10 minutes. Others are eager to meet you. Sprint over to the meeting point!"
      )
    })

    test("full message, user has not joined event", () => {
      expectEventArrivalBannerText(
        {
          hasJoinedEvent: false,
          countdown: { day: "today" },
          canShareArrivalStatus: true
        },
        "This event kicks off today. Join now or miss out on the epic fun!"
      )
    })

    test("full message, user has joined event, event is far away from starting", () => {
      expectEventArrivalBannerText(
        {
          hasJoinedEvent: true,
          countdown: { secondsToStart: TWO_AND_A_HALF_DAYS_IN_SECONDS },
          canShareArrivalStatus: true
        },
        "This event kicks off in 3 days. Gear up for some epic fun!"
      )
    })

    const expectEventArrivalBannerText = (
      props: Pick<
        EventArrivalBannerProps,
        "countdown" | "canShareArrivalStatus" | "hasJoinedEvent"
      >,
      text: string
    ) => {
      const { queryByText } = render(
        <EventArrivalBannerView {...props} onClose={jest.fn()} />
      )
      expect(queryByText(text)).toBeDisplayed()
    }
  })

  describe("useIsShowingEventArrivalBanner tests", () => {
    it("should update the result when subscription updated", async () => {
      let sendUpdate: ((hasArrived: boolean) => void) | undefined
      const { result } = renderUseIsShowingEventArrivalBanner(
        mockEventArrivalGeofencedRegion(),
        (_, callback) => {
          sendUpdate = callback
          return jest.fn()
        }
      )
      act(() => sendUpdate?.(true))
      await waitFor(() => expect(result.current.isShowing).toEqual(true))

      act(() => sendUpdate?.(false))
      await waitFor(() => expect(result.current.isShowing).toEqual(false))
    })

    it("should always be false when closed", async () => {
      let sendUpdate: ((hasArrived: boolean) => void) | undefined
      const { result } = renderUseIsShowingEventArrivalBanner(
        { ...mockEventRegion(), isArrived: true },
        (_, callback) => {
          sendUpdate = callback
          return jest.fn()
        }
      )
      act(() => result.current.close())
      expect(result.current.isShowing).toEqual(false)
      act(() => sendUpdate?.(true))
      await waitFor(() => expect(result.current.isShowing).toEqual(false))
    })

    const renderUseIsShowingEventArrivalBanner = (
      region: EventArrivalGeofencedRegion,
      subscribe: (
        region: EventRegion,
        fn: (hasArrived: boolean) => void
      ) => EventRegionMonitorUnsubscribe
    ) => {
      let hasArrived = false
      return renderHook(() => {
        return useIsShowingEventArrivalBanner(region, {
          hasArrivedAtRegion: () => hasArrived,
          monitorRegion: (region, callback) => {
            return subscribe(region, (isArrived) => {
              hasArrived = isArrived
              callback(isArrived)
            })
          }
        })
      })
    }
  })
})
