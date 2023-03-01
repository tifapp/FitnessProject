import React from "react"
import { Switch, Text, View } from "react-native"
import { useEventFormField, useEventFormValue } from "./EventForm"
import { TouchableOpacity } from "react-native-gesture-handler"
import DateTimePicker from "@components/formComponents/DateTimePicker"
import { HexColor } from "@lib/Color"
import HexColorPicker from "@components/formComponents/HexColorPicker"
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
      options={EventColors.all}
      createAccessibilityLabel={createEventColorAccessibilityLabel}
    />
  )
}

const createEventColorAccessibilityLabel = (color: HexColor) => {
  if (color === EventColors.Red) return "Red"
  if (color === EventColors.Turquoise) return "Turquoise"
  return "Unknown Color"
}
