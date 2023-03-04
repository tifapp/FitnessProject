import DateTimePicker from "@components/formComponents/DateTimePicker"
import { setPlatform } from "../helpers/Platform"
import "../helpers/Matchers"
import { render, screen } from "@testing-library/react-native"
import { useState } from "react"
import { View } from "react-native"
import { setDateTimePickerDate } from "../helpers/DateTimePicker"

describe("DateTimePicker tests", () => {
  test("android default date formatter formats date properly", () => {
    expectDefaultAndroidFormattedDate(
      new Date("2023-02-20 12:34:56"),
      "Feb 20, 2023"
    )
  })

  test("android default time formatter formats time properly for PM date", () => {
    expectDefaultAndroidFormattedDate(
      new Date("2023-02-20 12:34:56"),
      "12:34 PM"
    )
  })

  test("android default time formatter formats time properly for AM date", () => {
    expectDefaultAndroidFormattedDate(
      new Date("2023-02-20 11:34:56"),
      "11:34 AM"
    )
  })

  it("should be able to select a date when platform is iOS", () => {
    setPlatform("ios")
    testPickDate(new Date("2023-03-03T08:00:00"))
  })

  it("should be able to select a date when platform is android", () => {
    setPlatform("android")
    testPickDate(new Date("2023-03-03T08:00:00"))
  })
})

const testPickDate = (date: Date) => {
  renderDateTimePicker({ initialDate: new Date(0) })
  setPickerDate(date)
  expect(selectedDate(date)).toBeDisplayed()
}

const expectDefaultAndroidFormattedDate = (date: Date, formatted: string) => {
  setPlatform("android")
  const { queryByText } = renderDateTimePicker({
    initialDate: date
  })
  expect(queryByText(formatted)).toBeDisplayed()
}

type TestProps = {
  initialDate: Date
}

const renderDateTimePicker = (props: TestProps) => {
  return render(<Test {...props} />)
}

const testPickerId = "test-datetimepicker"

const Test = ({ initialDate }: TestProps) => {
  const [date, setDate] = useState(initialDate)
  return (
    <View testID={date.toISOString()}>
      <DateTimePicker
        testID={testPickerId}
        date={date}
        onDateChanged={setDate}
      />
    </View>
  )
}

const selectedDate = (date: Date) => screen.queryByTestId(date.toISOString())

const setPickerDate = (date: Date) => {
  setDateTimePickerDate({ toDate: date, testID: testPickerId })
}
