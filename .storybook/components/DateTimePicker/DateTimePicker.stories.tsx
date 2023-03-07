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
      <DateTimePicker {...props} date={date} onDateChanged={setDate} />
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
  args: {}
}

export default DateTimePickerMeta

export const NoDateLimit = (args: DateTimePickerProps) => <Picker {...args} />
