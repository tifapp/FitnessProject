import {
  EventFormValues,
  eventUpdateInputFromValues
} from "@components/eventForm"
import { EventColors } from "@lib/events/EventColors"

const testLocation = { latitude: 45, longitude: 45 }
const testEventTitle = "Test Event"
const testEventDescription = "Hello world this is a test"
const testStartDate = new Date("2023-02-23T00:17:00+0000")
const testEndDate = new Date("2023-02-23T00:19:00+0000")

const baseTestEventValues: EventFormValues = {
  title: testEventTitle,
  description: testEventDescription,
  location: testLocation,
  startDate: testStartDate,
  endDate: testEndDate,
  color: EventColors.Red,
  shouldHideAfterStartDate: false,
  radiusMeters: 0
} as const

describe("EventFormValues tests", () => {
  test("eventUpdateInputFromValues parses a valid event", () => {
    expect(eventUpdateInputFromValues(baseTestEventValues)).toMatchObject({
      title: testEventTitle,
      description: testEventDescription,
      location: testLocation,
      color: EventColors.Red,
      startDate: testStartDate,
      endDate: testEndDate,
      shouldHideAfterStartDate: false,
      radiusMeters: 0
    })
  })

  test("eventUpdateInputFromValues makes an empty description undefined in the result", () => {
    const values: EventFormValues = {
      ...baseTestEventValues,
      description: ""
    }
    expect(eventUpdateInputFromValues(values)!!.description).toBeUndefined()
  })

  test("eventUpdateInputFromValues is undefined for an empty title", () => {
    const values: EventFormValues = {
      ...baseTestEventValues,
      title: ""
    }
    expect(eventUpdateInputFromValues(values)).toBeUndefined()
  })

  test("eventUpdateInputFromValues is undefined when no location specified", () => {
    const values: EventFormValues = {
      ...baseTestEventValues,
      location: undefined
    }
    expect(eventUpdateInputFromValues(values)).toBeUndefined()
  })
})
