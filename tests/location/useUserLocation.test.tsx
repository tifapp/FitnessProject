import { SetDependencyValue } from "@lib/dependencies"
import {
  TrackedLocation,
  UserLocation,
  userLocationDependencyKey,
  useUserLocation
} from "@lib/location"
import { act, renderHook } from "@testing-library/react-native"
import { neverPromise, promiseComponents } from "../helpers/Promise"
import { unimplementedUserLocation } from "./helpers"

const testTrackedLocation: TrackedLocation = {
  coordinate: {
    latitude: 69.69696969,
    longitude: -69.696969
  },
  trackingDate: new Date()
}

describe("useUserLocation tests", () => {
  beforeEach(() => (userLocation = unimplementedUserLocation()))

  it("is tracks the user's location", () => {
    let sendLocationUpdate: (location: TrackedLocation) => void
    userLocation.track.mockImplementation((callback) => {
      sendLocationUpdate = callback
      return neverPromise()
    })
    const { result } = renderUserLocation()
    expect(result.current).toBeUndefined()

    act(() => sendLocationUpdate(testTrackedLocation))
    expect(result.current).toMatchObject(testTrackedLocation)
  })

  it("unsubs when unmounted", async () => {
    const unsubAction = jest.fn()
    const { resolver, promise } = promiseComponents<undefined>()
    userLocation.track.mockImplementation(() => {
      resolver(undefined)
      return Promise.resolve(unsubAction)
    })

    const { unmount } = renderUserLocation()
    await promise

    unmount()
    expect(unsubAction).toHaveBeenCalled()
  })
})

let userLocation = unimplementedUserLocation()

const renderUserLocation = () => {
  const wrapper = ({ children }: any) => (
    <SetDependencyValue
      forKey={userLocationDependencyKey}
      value={userLocation as unknown as UserLocation}
    >
      {children}
    </SetDependencyValue>
  )
  return renderHook(useUserLocation, { wrapper })
}
