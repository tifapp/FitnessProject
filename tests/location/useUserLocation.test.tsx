import { SetDependencyValue } from "@lib/dependencies"
import {
  TrackedLocation,
  UserLocationDependencyKeys,
  UserLocationTrackingUpdate
} from "@lib/location"
import { useUserLocation } from "@hooks/UserLocationHooks"
import { act, renderHook } from "@testing-library/react-native"

const testTrackedLocation: TrackedLocation = {
  coordinate: {
    latitude: 69.69696969,
    longitude: -69.696969
  },
  trackingDate: new Date()
}

describe("useUserLocation tests", () => {
  beforeEach(() => jest.resetAllMocks())

  test("processes simple location updates", () => {
    let sendLocationUpdate: (update: UserLocationTrackingUpdate) => void
    trackUserLocation.mockImplementation(
      (_, callback) => (sendLocationUpdate = callback)
    )
    const { result } = renderUseUserLocation()
    expect(result.current).toMatchObject({ status: "undetermined" })

    const update = { status: "success", location: testTrackedLocation }
    act(() => sendLocationUpdate(update as UserLocationTrackingUpdate))
    expect(result.current).toMatchObject(update)
  })
})

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
