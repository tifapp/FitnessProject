import { TiFScrollView } from "@components/common/ScrollView"
import { TiFFormMenuPickerView } from "@components/form-components/MenuPicker"
import { TiFFormRowItemView } from "@components/form-components/RowItem"
import { TiFFormCardSectionView } from "@components/form-components/Section"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { StyleProp, ViewStyle } from "react-native"
import { EventCalendarWeekdayID } from "TiFShared/domain-models/Settings"

export type CalendarSettingsProps = {
  style?: StyleProp<ViewStyle>
}

export const CalendarSettingsView = ({ style }: CalendarSettingsProps) => (
  <TiFScrollView style={style}>
    <WeekdayPickerSection />
  </TiFScrollView>
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
