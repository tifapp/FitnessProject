import { StyleProp, ViewStyle } from "react-native"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import { TiFFormCardSectionView } from "@components/form-components/Section"
import { settingsSelector } from "@settings-storage/Settings"
import { useUserSettings } from "@settings-storage/Hooks"
import { TiFFormMenuPickerView } from "@components/form-components/MenuPicker"
import { EventCalendarWeekdayID } from "TiFShared/domain-models/Settings"
import { TiFFormRowItemView } from "@components/form-components/RowItem"

export type CalendarSettingsProps = {
  style?: StyleProp<ViewStyle>
}

export const CalendarSettingsView = ({ style }: CalendarSettingsProps) => (
  <TiFFormScrollView style={style}>
    <WeekdayPickerSection />
  </TiFFormScrollView>
)

const WeekdayPickerSection = () => {
  const { settings, update } = useUserSettings(
    settingsSelector("eventCalendarStartOfWeekDay")
  )
  return (
    <TiFFormCardSectionView>
      <TiFFormRowItemView title="Start Week On">
        <TiFFormMenuPickerView
          options={WEEKDAY_PICKER_OPTIONS}
          selectedOption={settings.eventCalendarStartOfWeekDay}
          onOptionSelected={(eventCalendarStartOfWeekDay) => {
            update({ eventCalendarStartOfWeekDay })
          }}
        />
      </TiFFormRowItemView>
    </TiFFormCardSectionView>
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
