import DateTimePicker, {
  defaultFormatDate,
  defaultFormatTime
} from "@components/formComponents/DateTimePicker"
import { setPlatform } from "../helpers/Platform"
import "../helpers/Matchers"
import { render } from "@testing-library/react-native"
import { useState } from "react"
import { View } from "react-native"

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
})

const expectDefaultAndroidFormattedDate = (date: Date, formatted: string) => {
  setPlatform("android")
  const { queryByText } = renderDateTimePicker({
    initialDate: date
  })
  expect(queryByText(formatted)).toBeDisplayed()
}

type TestProps = {
  initialDate: Date
  minDate?: Date
  maxDate?: Date
}

const renderDateTimePicker = (props: TestProps) => {
  return render(<Test {...props} />)
}

const Test = ({ initialDate, minDate, maxDate }: TestProps) => {
  const [date, setDate] = useState(initialDate)
  return (
    <View testID={date.toString()}>
      <DateTimePicker
        label="Test"
        date={date}
        onDateChanged={setDate}
        minimumDate={minDate}
        maximumDate={maxDate}
      />
    </View>
  )
}
