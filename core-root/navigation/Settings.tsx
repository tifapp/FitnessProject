import { StackNavigatorType, XMarkBackButton } from "@components/Navigation"
import { StackScreenProps } from "@react-navigation/stack"
import { useUserSettings } from "@settings-storage/Hooks"
import { settingsSelector } from "@settings-storage/Settings"
import { Placemark } from "TiFShared/domain-models/Placemark"
import { memo } from "react"
import { EventSettingsView } from "settings-boundary/EventSettings"

export type EventSettingsParamsList = {
  eventSettings: undefined
  locationPresetSearch: Placemark
}

export const CreateEventSettingsScreens = <
  Params extends EventSettingsParamsList
>(
  stack: StackNavigatorType<Params>
) => {
  return (
    <>
      <stack.Screen
        name="eventSettings"
        options={() => ({
          headerLeft: XMarkBackButton,
          title: ""
        })}
      >
        {(props: any) => <EventSettingsScreen {...props} />}
      </stack.Screen>
    </>
  )
}

type EventSettingsScreenProps = StackScreenProps<
  EventSettingsParamsList,
  "eventSettings"
>

const EventSettingsScreen = memo(function Screen({
  navigation,
  route
}: EventSettingsScreenProps) {
  const { settings } = useUserSettings(settingsSelector("eventPresetLocation"))
  return (
    <EventSettingsView
      onLocationPresetTapped={(locationPreset: Placemark) =>
        navigation.navigate(
          "locationPresetSearch",
          settings.eventPresetLocation!
        )
      }
    />
  )
})
