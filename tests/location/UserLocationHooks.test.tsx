import { SetDependencyValue } from "@lib/dependencies"
import {
  LocationCoordinatesMocks,
  UserLocationTrackingUpdate
} from "@lib/location"
import {
  useTrackUserLocation,
  UserLocationDependencyKeys
} from "@hooks/UserLocation"
import { act, renderHook } from "@testing-library/react-native"

describe("UserLocationHooks tests", () => {
  describe("useUserLocation tests", () => {
    beforeEach(() => jest.resetAllMocks())

    const testLocation = {
      coordinates: LocationCoordinatesMocks.NYC,
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
      return renderHook(useTrackUserLocation, { wrapper })
    }

    test("processes simple location updates", () => {
      let sendLocationUpdate: (update: UserLocationTrackingUpdate) => void
      trackUserLocation.mockImplementation(
        (_, callback) => (sendLocationUpdate = callback)
      )
      const { result } = renderUseUserLocation()
      expect(result.current).toBeUndefined()

      const update = { status: "success", location: testLocation } as const
      act(() => sendLocationUpdate(update))
      expect(result.current).toMatchObject(update)
    })
  })
})
