import { SetDependencyValue } from "@lib/dependencies"
import {
  TrackedLocation,
  UserLocationDependencyKeys,
  UserLocationTrackingUpdate
} from "@lib/location"
import { useUserLocation } from "@hooks/UserLocation"
import { act, renderHook } from "@testing-library/react-native"

describe("UserLocationHooks tests", () => {
  describe("useUserLocation tests", () => {
    beforeEach(() => jest.resetAllMocks())

    const testTrackedLocation: TrackedLocation = {
      coordinate: {
        latitude: 69.69696969,
        longitude: -69.696969
      },
      trackingDate: new Date()
    }

    const trackUserLocation = jest.fn()

    const renderUseUserLocation = () => {
      const wrapper = ({ children }: any) => (
        <SetDependencyValue
          forKey={UserLocationDependencyKeys.track}
          value={trackUserLocation}
        >
          {children}
        </SetDependencyValue>
      )
      return renderHook(useUserLocation, { wrapper })
    }

    test("processes simple location updates", () => {
      let sendLocationUpdate: (update: UserLocationTrackingUpdate) => void
      trackUserLocation.mockImplementation(
        (_, callback) => (sendLocationUpdate = callback)
      )
      const { result } = renderUseUserLocation()
      expect(result.current).toMatchObject({ status: "undetermined" })

      const update = {
        status: "success",
        location: testTrackedLocation
      } as const
      act(() => sendLocationUpdate(update))
      expect(result.current).toMatchObject(update)
    })
  })
})
