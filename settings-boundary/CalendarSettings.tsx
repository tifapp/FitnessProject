import { StyleProp, ViewStyle } from "react-native"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsCardSectionView } from "./components/Section"
import { settingsSelector } from "@settings-storage/Settings"
import { useUserSettings } from "@settings-storage/Hooks"

export type CalendarSettingsProps = {
  style?: StyleProp<ViewStyle>
}

export const CalendarSettingsView = ({ style }: CalendarSettingsProps) => (
  <SettingsScrollView style={style}>
    <LayoutPickerSection />
    <WeekdayPickerSection />
  </SettingsScrollView>
)

const LayoutPickerSection = () => {
  const { settings, update } = useUserSettings(
    settingsSelector("eventCalendarDefaultLayout")
  )
  return (
    <SettingsCardSectionView
      title="Default Layout"
      subtitle="You can choose the starting layout of the calendar when you open the app."
    ></SettingsCardSectionView>
  )
}

const WeekdayPickerSection = () => {
  const { settings, update } = useUserSettings(
    settingsSelector("eventCalendarStartOfWeekDay")
  )
  return (
    <SettingsCardSectionView
      title="Default Layout"
      subtitle="You can choose the starting layout of the calendar when you open the app."
    ></SettingsCardSectionView>
  )
}
