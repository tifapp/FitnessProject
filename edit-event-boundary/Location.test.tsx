import { renderHook } from "@testing-library/react-native"
import { useEditEventFormLocation } from "./Location"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { Provider } from "jotai"
import { TEST_EDIT_EVENT_FORM_STORE } from "./TestHelpers"
import { GeocodingFunctionsProvider } from "@location/Geocoding"

describe("EditEventFormLocation tests", () => {
  describe("UseEditEventFormLocation tests", () => {
    const geocode = jest.fn()
    const reverseGeocode = jest.fn()

    const renderUseEventFormLocation = () => {
      return renderHook(useEditEventFormLocation, {
        wrapper: ({ children }) => (
          <GeocodingFunctionsProvider reverseGeocode={reverseGeocode}>
            <TestQueryClientProvider>
              <Provider store={TEST_EDIT_EVENT_FORM_STORE}>{children}</Provider>
            </TestQueryClientProvider>
          </GeocodingFunctionsProvider>
        )
      })
    }
  })
})
