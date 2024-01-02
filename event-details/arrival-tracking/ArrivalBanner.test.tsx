import { renderHook, waitFor } from "@testing-library/react-native"
import { useIsShowingEventArrivalBanner } from "./ArrivalBanner"
import { EventRegion } from "@shared-models/Event"
import { mockEventArrivalGeofencedRegion, mockEventRegion } from "./MockData"
import {
  EventArrivalsOperationKind,
  EventArrivalsOperationUnsubscribe
} from "./ArrivalsOperation"
import { EventArrivalGeofencedRegion } from "./Geofencing"
import { act } from "react-test-renderer"

describe("EventArrivalBanner tests", () => {
  describe("useIsShowingEventArrivalBanner tests", () => {
    it("should use the isArrived property for the initial isShowing value", () => {
      const { result } = renderUseIsShowingEventArrivalBanner(
        { ...mockEventRegion(), isArrived: true },
        jest.fn()
      )
      expect(result.current.isShowing).toEqual(true)
    })

    it("should subscribe to arrival updates for the correct region", () => {
      const region = mockEventArrivalGeofencedRegion()
      const subscribe = jest.fn()
      renderUseIsShowingEventArrivalBanner(region, subscribe)
      expect(subscribe).toHaveBeenCalledWith(
        {
          coordinate: region.coordinate,
          arrivalRadiusMeters: region.arrivalRadiusMeters
        },
        expect.any(Function)
      )
    })

    it("should update the result when subscription updated", async () => {
      let sendUpdate:
        | ((operationKind: EventArrivalsOperationKind) => void)
        | undefined
      const { result } = renderUseIsShowingEventArrivalBanner(
        mockEventArrivalGeofencedRegion(),
        (_, callback) => {
          sendUpdate = callback
          return jest.fn()
        }
      )
      act(() => sendUpdate?.("arrived"))
      await waitFor(() => expect(result.current.isShowing).toEqual(true))

      act(() => sendUpdate?.("departed"))
      await waitFor(() => expect(result.current.isShowing).toEqual(false))
    })

    it("should always be false when closed", async () => {
      let sendUpdate:
        | ((operationKind: EventArrivalsOperationKind) => void)
        | undefined
      const { result } = renderUseIsShowingEventArrivalBanner(
        { ...mockEventRegion(), isArrived: true },
        (_, callback) => {
          sendUpdate = callback
          return jest.fn()
        }
      )
      act(() => result.current.close())
      expect(result.current.isShowing).toEqual(false)
      act(() => sendUpdate?.("arrived"))
      await waitFor(() => expect(result.current.isShowing).toEqual(false))
    })

    it("should unsubscribe when unmounted", () => {
      const unsubscribe = jest.fn()
      const { unmount } = renderUseIsShowingEventArrivalBanner(
        mockEventArrivalGeofencedRegion(),
        () => unsubscribe
      )
      unmount()
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })

    it("should unsubscribe when closed", () => {
      const unsubscribe = jest.fn()
      const { result } = renderUseIsShowingEventArrivalBanner(
        mockEventArrivalGeofencedRegion(),
        () => unsubscribe
      )
      act(() => result.current.close())
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })

    it("should unsubscribe only once when closed and unmounted", () => {
      const unsubscribe = jest.fn()
      const { result, unmount } = renderUseIsShowingEventArrivalBanner(
        mockEventArrivalGeofencedRegion(),
        () => unsubscribe
      )
      act(() => result.current.close())
      unmount()
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })

    const renderUseIsShowingEventArrivalBanner = (
      region: EventArrivalGeofencedRegion,
      subscribe: (
        region: EventRegion,
        fn: (operationKind: EventArrivalsOperationKind) => void
      ) => EventArrivalsOperationUnsubscribe
    ) => {
      return renderHook(() => {
        return useIsShowingEventArrivalBanner(region, subscribe)
      })
    }
  })
})
