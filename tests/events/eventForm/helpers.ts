import { EventColors } from "@lib/events/EventColors"

export const baseTestEventValues = {
  title: "Test Event",
  description: "Hello world this is a test",
  locationInfo: {
    coordinates: { latitude: 45.123456, longitude: 45.123456 },
    placemarkInfo: {
      name: "Test",
      address: "1234 Test Dr, TestCity, TestState 12345"
    }
  },
  startDate: new Date("2023-02-23T00:17:00+0000"),
  endDate: new Date("2023-02-23T00:19:00+0000"),
  color: EventColors.Red,
  shouldHideAfterStartDate: false,
  radiusMeters: 0
} as const
