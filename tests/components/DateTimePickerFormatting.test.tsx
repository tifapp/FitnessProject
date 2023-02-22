import {
  defaultFormatDate,
  defaultFormatTime
} from "@components/formComponents/DateTimePicker"

const testPMDate = new Date("2023-02-20 12:34:56")
const testAMDate = new Date("2023-02-20 11:34:56")

describe("DateTimePickerFormatting tests", () => {
  test("default date formatter formats date properly", () => {
    expect(defaultFormatDate(testPMDate)).toEqual("Feb 20, 2023")
  })

  test("default time formatter formats time properly for PM date", () => {
    expect(defaultFormatTime(testPMDate)).toEqual("12:34 PM")
  })

  test("default time formatter formats time properly for AM date", () => {
    expect(defaultFormatTime(testAMDate)).toEqual("11:34 AM")
  })
})
