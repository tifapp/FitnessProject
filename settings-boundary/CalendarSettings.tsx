import { StyleProp, ViewStyle } from "react-native"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsCardSectionView } from "./components/Section"
import { settingsSelector } from "@settings-storage/Settings"
import { useUserSettings } from "@settings-storage/Hooks"
import { SettingsMenuPickerView } from "./components/MenuPicker"
import { EventCalendarWeekdayID } from "TiFShared/domain-models/Settings"
import { SettingsRowItemView } from "./components/RowItem"

export type CalendarSettingsProps = {
  style?: StyleProp<ViewStyle>
}

export const CalendarSettingsView = ({ style }: CalendarSettingsProps) => (
  <SettingsScrollView style={style}>
    <WeekdayPickerSection />
  </SettingsScrollView>
)

const WeekdayPickerSection = () => {
  const { settings, update } = useUserSettings(
    settingsSelector("eventCalendarStartOfWeekDay")
  )
  return (
    <SettingsCardSectionView>
      <SettingsRowItemView title="Start Week On">
        <SettingsMenuPickerView
          options={WEEKDAY_PICKER_OPTIONS}
          selectedOption={settings.eventCalendarStartOfWeekDay}
          onOptionSelected={(eventCalendarStartOfWeekDay) => {
            update({ eventCalendarStartOfWeekDay })
          }}
        />
      </SettingsRowItemView>
    </SettingsCardSectionView>
  )
}

const WEEKDAY_PICKER_OPTIONS = new Map<
  EventCalendarWeekdayID,
  { title: string }
>([
  ["sunday", { title: "Sunday" }],
  ["monday", { title: "Monday" }],
  ["tuesday", { title: "Tuesday" }],
  ["wednesday", { title: "Wednesday" }],
  ["thursday", { title: "Thursday" }],
  ["friday", { title: "Friday" }],
  ["saturday", { title: "Saturday" }]
])
