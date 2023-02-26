import {
  defaultFormatDate,
  defaultFormatTime
} from "@components/formComponents/DateTimePicker"

describe("DateTimePicker tests", () => {
  test("default date formatter formats date properly", () => {
    expect(defaultFormatDate(new Date("2023-02-20 12:34:56"))).toEqual(
      "Feb 20, 2023"
    )
  })

  test("default time formatter formats time properly for PM date", () => {
    expect(defaultFormatTime(new Date("2023-02-20 12:34:56"))).toEqual(
      "12:34 PM"
    )
  })

  test("default time formatter formats time properly for AM date", () => {
    expect(defaultFormatTime(new Date("2023-02-20 11:34:56"))).toEqual(
      "11:34 AM"
    )
  })
})
