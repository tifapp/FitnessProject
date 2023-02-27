import { MinMaxDateRange } from "@lib/Date"

describe("MinMaxDateRange tests", () => {
  test("moveStartDate basic", () => {
    const range = new MinMaxDateRange(
      new Date("2023-02-25T00:17:00"),
      new Date("2023-02-25T00:18:00")
    ).moveStartDate(new Date(0))
    expect(range.startDate).toEqual(new Date(0))
    expect(range.endDate).toEqual(new Date("2023-02-25T00:18:00"))
  })

  test("moveEndDate basic", () => {
    const newEndDate = new Date("3000-01-01T00:00:00")
    const range = new MinMaxDateRange(
      new Date("2023-02-25T00:17:00"),
      new Date("2023-02-25T00:18:00")
    ).moveEndDate(newEndDate)
    expect(range.startDate).toEqual(new Date("2023-02-25T00:17:00"))
    expect(range.endDate).toEqual(newEndDate)
  })

  it("setting start date past end date moves end date past the start date by the previous interval between the dates", () => {
    const range = new MinMaxDateRange(
      new Date("2023-02-25T00:17:00"),
      new Date("2023-02-25T00:18:00")
    ).moveStartDate(new Date("2023-02-25T00:19:00"))
    // NB: The previous interval was 1 minute, so we ensure the end date is 1 minute ahead of the start date
    expect(range.endDate).toEqual(new Date("2023-02-25T00:20:00"))
  })

  it("setting end date before start date moves start date before the end date by the previous interval between the dates", () => {
    const range = new MinMaxDateRange(
      new Date("2023-02-25T00:17:00"),
      new Date("2023-02-25T00:18:00")
    ).moveEndDate(new Date("2023-02-25T00:16:00"))
    // NB: The previous interval was 1 minute, so we ensure the start date is 1 minute behind of the end date
    expect(range.startDate).toEqual(new Date("2023-02-25T00:15:00"))
  })

  it("should correctly adjust when the initial start date is past the initial end date by the current interval between dates", () => {
    const range = new MinMaxDateRange(
      new Date("2023-02-25T00:20:00"),
      new Date("2023-02-25T00:18:00")
    )
    // NB: 2 minute interval
    expect(range.startDate).toEqual(new Date("2023-02-25T00:20:00"))
    expect(range.endDate).toEqual(new Date("2023-02-25T00:22:00"))
  })
})
