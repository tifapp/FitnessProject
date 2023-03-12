import { amplifyTextSearchLocations } from "@lib/location/search"
import { Geo } from "aws-amplify"

jest.mock("aws-amplify")
const geoTextSearchSpy = jest.spyOn(Geo, "searchByText")

const testTextQuery = "McDonalds Play Places"

describe("AmplifyLocationTextSearch tests", () => {
  beforeEach(() => geoTextSearchSpy.mockReset())

  it("creates a proper request to amplify geo with custom options", async () => {
    geoTextSearchSpy.mockResolvedValue([])
    await amplifyTextSearchLocations(testTextQuery, {
      nearLocation: { latitude: 42, longitude: -121 },
      limit: 25
    })
    expect(geoTextSearchSpy).toHaveBeenCalledWith(testTextQuery, {
      countries: ["USA"],
      maxResults: 25,
      biasPosition: [-121, 42]
    })
  })

  it("creates a proper request to amplify geo with no custom options", async () => {
    geoTextSearchSpy.mockResolvedValue([])
    await amplifyTextSearchLocations(testTextQuery)
    expect(geoTextSearchSpy).toHaveBeenCalledWith(testTextQuery, {
      countries: ["USA"]
    })
  })

  it("handles an amplify geo text search response properly", async () => {
    geoTextSearchSpy.mockResolvedValue([
      {
        geometry: { point: [-122.36738, 47.61609] },
        label: "Amazon Go, 2131 7th Ave, Seattle, WA, 98121, USA"
      },
      {
        geometry: { point: [-112.10668, 46.31909] },
        label: "Amazon, Jefferson City, MT, United States"
      }
    ])
    expect(await amplifyTextSearchLocations(testTextQuery)).toEqual([
      {
        name: "Amazon Go",
        formattedAddress: "2131 7th Ave, Seattle, WA, 98121, USA",
        coordinates: { latitude: 47.61609, longitude: -122.36738 }
      },
      {
        name: "Amazon",
        formattedAddress: "Jefferson City, MT, United States",
        coordinates: { latitude: 46.31909, longitude: -112.10668 }
      }
    ])
  })

  it("filters amplify geo results with unknown geometry", async () => {
    geoTextSearchSpy.mockResolvedValue([
      {
        geometry: undefined,
        label: "Amazon Go, 2131 7th Ave, Seattle, WA, 98121, USA"
      }
    ])
    expect(await amplifyTextSearchLocations(testTextQuery)).toEqual([])
  })
})
