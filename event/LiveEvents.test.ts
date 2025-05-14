import { createTestQueryClient } from "@test-helpers/ReactQuery"
import {
  EMPTY_LIVE_EVENTS,
  LIVE_EVENT_SECONDS_TO_START,
  LiveEventsStore,
  liveEvents
} from "./LiveEvents"
import { AlphaUserMocks } from "@user/alpha/MockData"
import { clientSideEventFromResponse } from "./ClientSideEvent"
import { EventMocks } from "@event-details-boundary/MockData"
import { waitFor } from "@testing-library/react-native"
import { fakeTimers } from "@test-helpers/Timers"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { TiFAPI } from "TiFShared/api"
import { mockTiFServer } from "TiFShared/test-helpers/mockAPIServer"

const TEST_USER_ID = AlphaUserMocks.TheDarkLord.id

describe("LiveEvents tests", () => {
  describe("FetchLiveEvents tests", () => {
    it("should split events by whether or not the are ongoing or starting soon", async () => {
      const ongoingEvent = {
        ...EventMocks.MockSingleAttendeeResponse,
        time: {
          ...EventMocks.MockSingleAttendeeResponse.time,
          secondsToStart: -190
        },
        id: 10
      }
      const doneEvent = {
        ...EventMocks.MockSingleAttendeeResponse,
        endedDateTime: new Date(),
        id: 9
      }
      const doneOngoingEvent = {
        ...EventMocks.MockSingleAttendeeResponse,
        endedDateTime: new Date(),
        time: {
          ...EventMocks.MockSingleAttendeeResponse.time,
          secondsToStart: -190
        },
        id: 8
      }
      const startingSoonEvent = {
        ...EventMocks.MockSingleAttendeeResponse,
        time: {
          ...EventMocks.MockSingleAttendeeResponse.time,
          secondsToStart: 1800
        },
        id: 11
      }
      mockTiFServer({
        upcomingEvents: {
          expectedRequest: {
            query: {
              userId: TEST_USER_ID,
              maxSecondsToStart: `${LIVE_EVENT_SECONDS_TO_START}`
            }
          },
          mockResponse: {
            status: 200,
            data: {
              events: [
                ongoingEvent,
                doneOngoingEvent,
                doneEvent,
                startingSoonEvent
              ]
            }
          }
        }
      })
      const events = await liveEvents(
        TEST_USER_ID,
        TiFAPI.testAuthenticatedInstance
      )
      expect(events.startingSoon.map((e) => e.id)).toEqual([
        startingSoonEvent.id
      ])
      expect(events.ongoing.map((e) => e.id)).toEqual([ongoingEvent.id])
    })
  })

  describe("LiveEventsStore tests", () => {
    const liveEvents = jest.fn()

    const ROTATION_MILLIS = 5000

    const testStore = () => {
      return new LiveEventsStore(
        createTestQueryClient(),
        liveEvents,
        ROTATION_MILLIS
      )
    }

    fakeTimers()
    beforeEach(() => {
      liveEvents.mockReset()
    })

    it("should emit empty live events by default", () => {
      const callback = jest.fn()
      const store = testStore()
      store.subscribe(callback)
      expect(callback).toHaveBeenCalledWith(EMPTY_LIVE_EVENTS)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it("should emit fetched live events", async () => {
      const callback = jest.fn()
      const store = testStore()
      const events = {
        ongoing: [
          clientSideEventFromResponse(EventMocks.MockSingleAttendeeResponse)
        ],
        startingSoon: []
      }
      liveEvents.mockResolvedValue(events)

      store.subscribe(callback)
      const unsub = store.beginObserving(TEST_USER_ID)

      await waitFor(() => {
        expect(callback).toHaveBeenNthCalledWith(2, events)
      })
      expect(callback).toHaveBeenCalledTimes(2)
      unsub()
    })

    it("should move starting soon events to ongoing when enough time passes for them to start", async () => {
      jest.setSystemTime(new Date(0))
      const callback = jest.fn()
      const store = testStore()
      const baseEvent = clientSideEventFromResponse(
        EventMocks.MockSingleAttendeeResponse
      )
      const event = {
        ...baseEvent,
        time: { ...baseEvent.time, secondsToStart: 3 }
      }
      liveEvents.mockResolvedValue({ ongoing: [], startingSoon: [event] })

      store.subscribe(callback)
      const unsub = store.beginObserving(TEST_USER_ID)

      await waitFor(() => {
        expect(store.current).toEqual({ ongoing: [], startingSoon: [event] })
        expect(callback).toHaveBeenCalledWith({
          ongoing: [],
          startingSoon: [event]
        })
      })

      jest.advanceTimersByTime(ROTATION_MILLIS)

      expect(store.current).toEqual({ ongoing: [event], startingSoon: [] })
      expect(callback).toHaveBeenNthCalledWith(3, {
        ongoing: [event],
        startingSoon: []
      })
      unsub()
    })

    it("should remove events to ongoing when enough time passes for them to finish", async () => {
      jest.setSystemTime(new Date(0))
      const callback = jest.fn()
      const store = testStore()
      const baseEvent = clientSideEventFromResponse(
        EventMocks.MockSingleAttendeeResponse
      )
      const range = dateRange(new Date(), new Date().ext.addSeconds(10))
      const event = {
        ...baseEvent,
        time: { ...baseEvent.time, secondsToStart: 0, dateRange: range }
      }
      liveEvents.mockResolvedValue({ ongoing: [event], startingSoon: [] })

      store.subscribe(callback)
      const unsub = store.beginObserving(TEST_USER_ID)

      await waitFor(() => {
        expect(store.current).toEqual({ ongoing: [event], startingSoon: [] })
        expect(callback).toHaveBeenCalledWith({
          ongoing: [event],
          startingSoon: []
        })
      })

      jest.advanceTimersByTime(ROTATION_MILLIS * 2)

      expect(store.current).toEqual(EMPTY_LIVE_EVENTS)
      expect(callback).toHaveBeenNthCalledWith(3, {
        ongoing: [],
        startingSoon: []
      })
      unsub()
    })
  })
})
