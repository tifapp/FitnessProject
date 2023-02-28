import React from "react"
import { FixedDateRange } from "@lib/Date"
import { dayjs } from "@lib/dayjs"
import { Dayjs } from "dayjs"
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
        <Text>{formatDateRange(dateRange)}</Text>
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

// TODO: - Should this support multiple locales?
const formatDateRange = (dateRange: FixedDateRange) => {
  const start = dayjs(dateRange.startDate)
  const end = dayjs(dateRange.endDate)

  const endDateFormat = end.isSame(start, "day")
    ? formatTime(end)
    : formatDateTime(end)

  const startDateFormat = start.isToday()
    ? `Today ${formatTime(start)}`
    : formatDateTime(start)

  return `${startDateFormat} - ${endDateFormat}`
}

const formatDateTime = (date: Dayjs) => {
  const formattedDate = date.isTomorrow() ? "Tomorrow" : date.format("MMM D,")
  return `${formattedDate} ${formatTime(date)}`
}

const formatTime = (date: Dayjs) => {
  return date.format(date.minute() !== 0 ? "h:mma" : "ha")
}
