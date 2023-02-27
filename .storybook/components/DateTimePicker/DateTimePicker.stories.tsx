import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { useState } from "react"
import { View, Text } from "react-native"
import DateTimePicker, {
  DateTimePickerProps
} from "../../../components/formComponents/DateTimePicker"

const Picker = (props: DateTimePickerProps) => {
  const [date, setDate] = useState(new Date())
  return (
    <View>
      <DateTimePicker
        {...props}
        date={date}
        labelStyle={{ fontWeight: "bold" }}
        onDateChanged={setDate}
      />
      <Text>React state representation of selected date:</Text>
      <Text>
        {date.toDateString()} {date.toTimeString()}
      </Text>
    </View>
  )
}

const DateTimePickerMeta: ComponentMeta<typeof DateTimePicker> = {
  title: "DateTimePicker",
  component: Picker,
  args: {
    label: "Pick Date and Time"
  }
}

export default DateTimePickerMeta

export const NoDateLimit = (args: DateTimePickerProps) => <Picker {...args} />

const minDate = new Date("2020-01-01T00:00:00")
const maxDate = new Date("2024-01-01T00:00:00")

export const MinMaxDate = (args: DateTimePickerProps) => (
  <Picker minimumDate={minDate} maximumDate={maxDate} {...args} />
)

const startHour = new Date("2023-02-26T14:00:00")
const endHour = new Date("2023-02-26T16:00:00")

export const TwoHourPeriod = (args: DateTimePickerProps) => (
  <Picker minimumDate={startHour} maximumDate={endHour} {...args} />
)
