import { TextField } from "@components/TextFields"
import { useUserSettings } from "@settings-storage/Hooks"
import { UserSettings } from "TiFShared/domain-models/User"
import { StyleProp, View, ViewStyle } from "react-native"
import { ScrollView } from "react-native-gesture-handler"

export type EventSettingsSelector = {}

export type EventSettingsViewProps = {
  style?: StyleProp<ViewStyle>
}

export const EventSettingsView = ({ style }: EventSettingsViewProps) => {
  const { settings } = useUserSettings(eventSettingsSelector)
  return (
    <ScrollView style={style}>
      <View>
        <TextField></TextField>
      </View>
    </ScrollView>
  )
}

const eventSettingsSelector = (settings: UserSettings) => ({
  eventDuration: settings.eventDuration
  eventDescription: settings.eventDescription
  eventLocation: settings.eventLocation
})
