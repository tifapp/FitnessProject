import {
  AmplifyLocationSearchClient,
  LocationSearchClient
} from "@lib/location/search"
import { Geo } from "aws-amplify"

jest.mock("aws-amplify")
const amplifyTextSearchSpy = jest.spyOn(Geo, "searchByText")

const testTextQuery = "McDonalds Play Places"

let client: LocationSearchClient
describe("AmplifyLocationSearchClient tests", () => {
  beforeEach(() => {
    client = new AmplifyLocationSearchClient()
    amplifyTextSearchSpy.mockReset()
  })

  test("textSearch creates a proper request to amplify geo with custom options", async () => {
    amplifyTextSearchSpy.mockResolvedValue([])
    await client.textSearch(testTextQuery, {
      biasLocation: { latitude: 42, longitude: -121 },
      limit: 25
    })
    expect(amplifyTextSearchSpy).toHaveBeenCalledWith(testTextQuery, {
      countries: ["USA"],
      maxResults: 25,
      biasPosition: [-121, 42]
    })
  })

  test("textSearch creates a proper request to amplify geo with no custom options", async () => {
    amplifyTextSearchSpy.mockResolvedValue([])
    await client.textSearch(testTextQuery)
    expect(amplifyTextSearchSpy).toHaveBeenCalledWith(testTextQuery, {
      countries: ["USA"]
    })
  })

  test("textSearch handles an amplify geo text search response properly", async () => {
    amplifyTextSearchSpy.mockResolvedValue([
      {
        geometry: { point: [-122.36738, 47.61609] },
        label: "Amazon Go, 2131 7th Ave, Seattle, WA, 98121, USA"
      },
      {
        geometry: { point: [-112.10668, 46.31909] },
        label: "Amazon, Jefferson City, MT, United States"
      }
    ])
    expect(await client.textSearch(testTextQuery)).toEqual([
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

  test("textSearch filters amplify geo results with unknown geometry", async () => {
    amplifyTextSearchSpy.mockResolvedValue([
      {
        geometry: undefined,
        label: "Amazon Go, 2131 7th Ave, Seattle, WA, 98121, USA"
      }
    ])
    expect(await client.textSearch(testTextQuery)).toEqual([])
  })
})
