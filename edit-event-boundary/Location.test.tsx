import { renderHook, waitFor } from "@testing-library/react-native"
import { useEditEventFormLocation } from "./Location"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { Provider } from "jotai"
import { TEST_EDIT_EVENT_FORM_STORE } from "./TestHelpers"
import { GeocodingFunctionsProvider } from "@location/Geocoding"
import { mockLocationCoordinate2D, mockPlacemark } from "@location/MockData"
import { editEventFormValueAtoms } from "./FormValues"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"

describe("EditEventFormLocation tests", () => {
  describe("UseEditEventFormLocation tests", () => {
    const geocode = jest.fn()
    const reverseGeocode = jest.fn()

    beforeEach(() => jest.resetAllMocks())

    it("should be undefined when no coordinate or placemark", () => {
      const { result } = renderUseEventFormLocation()
      expect(result.current).toEqual(undefined)
    })

    it("should use the provided location without fetching if both coordinate and placemark are provided", async () => {
      const placemark = mockPlacemark()
      const coordinate = mockLocationCoordinate2D()
      TEST_EDIT_EVENT_FORM_STORE.set(editEventFormValueAtoms.location, {
        placemark,
        coordinate
      })
      const { result } = renderUseEventFormLocation()
      expect(result.current).toEqual({ placemark, coordinate })
      await verifyNeverOccurs(() => {
        expect(reverseGeocode).toHaveBeenCalled()
        expect(geocode).toHaveBeenCalled()
      })
    })

    it("should fetch the coordinate when only placemark provided", async () => {
      const placemark = mockPlacemark()
      const coordinate = mockLocationCoordinate2D()
      geocode.mockResolvedValueOnce({ placemark, coordinate })
      TEST_EDIT_EVENT_FORM_STORE.set(editEventFormValueAtoms.location, {
        placemark,
        coordinate: undefined
      })
      const { result } = renderUseEventFormLocation()
      await waitFor(() => {
        expect(result.current).toEqual({ placemark, coordinate })
      })

      const formLocation = TEST_EDIT_EVENT_FORM_STORE.get(
        editEventFormValueAtoms.location
      )
      expect(formLocation).toEqual({ placemark, coordinate })
    })

    it("should fetch the placemark when only coordinate provided", async () => {
      const placemark = mockPlacemark()
      const coordinate = mockLocationCoordinate2D()
      reverseGeocode.mockResolvedValueOnce({ placemark, coordinate })
      TEST_EDIT_EVENT_FORM_STORE.set(editEventFormValueAtoms.location, {
        placemark: undefined,
        coordinate
      })
      const { result } = renderUseEventFormLocation()
      await waitFor(() => {
        expect(result.current).toEqual({ placemark, coordinate })
      })

      const formLocation = TEST_EDIT_EVENT_FORM_STORE.get(
        editEventFormValueAtoms.location
      )
      expect(formLocation).toEqual({ placemark, coordinate })
    })

    const renderUseEventFormLocation = () => {
      return renderHook(useEditEventFormLocation, {
        wrapper: ({ children }) => (
          <GeocodingFunctionsProvider
            geocode={geocode}
            reverseGeocode={reverseGeocode}
          >
            <TestQueryClientProvider>
              <Provider store={TEST_EDIT_EVENT_FORM_STORE}>{children}</Provider>
            </TestQueryClientProvider>
          </GeocodingFunctionsProvider>
        )
      })
    }
  })
})
