import React from "react"
import { Switch, Text, View } from "react-native"
import { useEventFormField, useEventFormValue } from "./EventForm"
import { TouchableOpacity } from "react-native-gesture-handler"
import DateTimePicker from "@components/formComponents/DateTimePicker"
import { HexColor } from "@lib/Color"
import HexColorPicker, {
  HexColorPickerOption
} from "@components/formComponents/HexColorPicker"
import { EventColors } from "@lib/events/EventColors"

/**
 * A horizontally scrolling toolbar for an event form.
 *
 * Each tab on the toolbar opens a bottom sheet screen
 * where its respective form values can be edited.
 */
export const EventFormToolbar = () => {
  const dateRange = useEventFormValue("dateRange")
  return (
    <View>
      <TouchableOpacity accessibilityLabel="Update Dates">
        <Text>{dateRange.formatted()}</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityLabel="More Settings">
        <View />
      </TouchableOpacity>
      <TouchableOpacity accessibilityLabel="Pick Color">
        <View />
      </TouchableOpacity>
      <ColorSection />
      <DateRangeSection />
      <MoreSettingsSection />
      <TouchableOpacity accessibilityLabel="Close">
        <View />
      </TouchableOpacity>
    </View>
  )
}

const DateRangeSection = () => {
  const [dateRange, setDateRange] = useEventFormField("dateRange")
  return (
    <View>
      <DateTimePicker
        testID="eventFormStartDateTimePicker"
        label="Start Date"
        date={dateRange.startDate}
        onDateChanged={(date) =>
          setDateRange((range) => range.moveStartDate(date))
        }
      />
      <DateTimePicker
        testID="eventFormEndDateTimePicker"
        label="End Date"
        date={dateRange.endDate}
        onDateChanged={(date) =>
          setDateRange((range) => range.moveEndDate(date))
        }
      />
    </View>
  )
}

const MoreSettingsSection = () => {
  const [shouldHideAfterStartDate, setShouldHideAfterStartDate] =
    useEventFormField("shouldHideAfterStartDate")
  return (
    <Switch
      testID="eventFormShouldHideAfterStartDateSwitch"
      value={shouldHideAfterStartDate}
      onValueChange={setShouldHideAfterStartDate}
    />
  )
}

const ColorSection = () => {
  const [color, setColor] = useEventFormField("color")
  return (
    <HexColorPicker
      color={color}
      onChange={setColor}
      options={eventColorOptions}
    />
  )
}

const eventColorOptions = [
  { color: EventColors.Red, accessibilityLabel: "Red" },
  { color: EventColors.Orange, accessibilityLabel: "Orange" },
  { color: EventColors.Yellow, accessibilityLabel: "Yellow" },
  { color: EventColors.BrightPink, accessibilityLabel: "Bright Pink" },
  { color: EventColors.CherryBlossom, accessibilityLabel: "Cherry Blossom" },
  { color: EventColors.LightBlue, accessibilityLabel: "Light Blue" },
  { color: EventColors.LightPurple, accessibilityLabel: "Light Purple" },
  { color: EventColors.Blue, accessibilityLabel: "Blue" },
  { color: EventColors.Purple, accessibilityLabel: "Purple" },
  { color: EventColors.Turquoise, accessibilityLabel: "Turquoise" },
  { color: EventColors.Green, accessibilityLabel: "Green" },
  { color: EventColors.Brown, accessibilityLabel: "Brown" }
] as HexColorPickerOption[]
