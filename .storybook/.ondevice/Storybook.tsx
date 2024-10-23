import React, { useState } from "react"
import { useAppFonts } from "../../lib/Fonts"

// Import your stories
import { setupCognito } from "@auth-boundary/CognitoHelpers"
import { InMemorySecureStore } from "@auth-boundary/CognitoSecureStorage"
import { sqliteLogHandler, sqliteLogs } from "@lib/Logging"
import { dayjs } from "TiFShared/lib/Dayjs"
import { addLogHandler, consoleLogHandler } from "TiFShared/logging"
import AttendeesListMeta, {
  Basic as AttendeesListBasic
} from "../components/AttendeesList/AttendeesList.stories"
import ButtonsMeta, {
  Basic as ButtonsBasic
} from "../components/Buttons/Buttons.stories"
import EditEventDurationsMeta, {
  Basic as EditEventDurationsBasic
} from "../components/EditEvent/DurationPicker.stories"
import EnterGoalMeta, {
  Basic as EnterGoalBasic
} from "../components/EnterGoal/EnterGoal.stories"
import EnterNameMeta, {
  Basic as EnterNameBasic
} from "../components/EnterMotivation/EnterMotivation.stories"
import EventDetailsMeta, {
  Basic as EventDetailsBasic
} from "../components/EventDetails/EventDetails.stories"
import ExploreEventsMeta, {
  Basic as ExploreEventsBasic
} from "../components/Explore/Explore.stories"
import ForgotPasswordMeta, {
  Basic as ForgotPasswordBasic
} from "../components/ForgotPassword/ForgotPasswordForm.stories"
import GameNavigationMeta, {
  Basic as GameNavigationBasic
} from "../components/InteractiveNarrative/Navigation.stories"
import LocationSearchMeta, {
  Basic as LocationSearchBasic
} from "../components/LocationSearch/LocationSearch.stories"
import NarrationMeta, {
  Basic as NarrationBasic
} from "../components/Narration/Narration.stories"
import RegionMonitoringMeta, {
  Basic as RegionMonitoringBasic
} from "../components/RegionMonitoring/RegionMonitoring.stories"
import SearchBarMeta, {
  Default as SearchBarBasic
} from "../components/SearchBar/SearchBar.stories"
import EventSettingsDurationMeta, {
  Basic as EventSettingsDurationBasic
} from "../components/SettingsScreen/EventSettingsDurations.stories"
import EventSettingsMeta, {
  Basic as EventSettingsBasic
} from "../components/SettingsScreen/EventSettingsScreen.stories"
import SettingsMeta, {
  Basic as SettingsScreenBasic
} from "../components/SettingsScreen/SettingsScreen.stories"
import SignInMeta, {
  Basic as SignInBasic
} from "../components/SignIn/SignIn.stories"
import SignUpMeta, {
  Basic as SignUpBasic
} from "../components/SignUp/SignUp.stories"
import TextFieldMeta, {
  Basic as TextFieldBasic
} from "../components/TextField/TextField.stories"
import VesselPickerMeta, {
  Basic as VesselPickerBasic
} from "../components/VesselPicker/VesselPicker.stories"

setupCognito(new InMemorySecureStore())
addLogHandler(consoleLogHandler())
addLogHandler(
  sqliteLogHandler(sqliteLogs, dayjs.duration(2, "weeks").asSeconds())
)

const stories = [
  {
    name: GameNavigationMeta.title,
    component: GameNavigationBasic,
    args: GameNavigationMeta.args
  },
  {
    name: VesselPickerMeta.title,
    component: VesselPickerBasic,
    args: VesselPickerMeta.args
  },
  {
    name: EnterNameMeta.title,
    component: EnterNameBasic,
    args: EnterNameMeta.args
  },
  {
    name: EnterGoalMeta.title,
    component: EnterGoalBasic,
    args: EnterGoalMeta.args
  },
  {
    name: NarrationMeta.title,
    component: NarrationBasic,
    args: NarrationMeta.args
  },
  {
    name: SettingsMeta.title,
    component: SettingsScreenBasic,
    args: SettingsMeta.args
  },
  {
    name: ExploreEventsMeta.title,
    component: ExploreEventsBasic,
    args: ExploreEventsMeta.args
  },
  {
    name: EventSettingsMeta.title,
    component: EventSettingsBasic,
    args: EventSettingsMeta.args
  },
  {
    name: EventSettingsDurationMeta.title,
    component: EventSettingsDurationBasic,
    args: EventSettingsDurationMeta.args
  },
  {
    name: TextFieldMeta.title,
    component: TextFieldBasic,
    args: TextFieldMeta.args
  },
  {
    name: SearchBarMeta.title,
    component: SearchBarBasic,
    args: SearchBarMeta.args
  },
  {
    name: LocationSearchMeta.title,
    component: LocationSearchBasic,
    args: LocationSearchMeta.args
  },
  {
    name: ForgotPasswordMeta.title,
    component: ForgotPasswordBasic,
    args: ForgotPasswordMeta.args
  },
  {
    name: SignUpMeta.title,
    component: SignUpBasic,
    args: SignUpMeta.args
  },
  {
    name: SignInMeta.title,
    component: SignInBasic,
    args: SignInMeta.args
  },
  {
    name: ButtonsMeta.title,
    component: ButtonsBasic,
    args: ButtonsMeta.args
  },
  {
    name: EventDetailsMeta.title,
    component: EventDetailsBasic,
    args: EventDetailsMeta.args
  },
  {
    name: RegionMonitoringMeta.title,
    component: RegionMonitoringBasic,
    args: RegionMonitoringMeta.args
  },
  {
    name: AttendeesListMeta.title,
    component: AttendeesListBasic,
    args: AttendeesListMeta.args
  },
  {
    name: EditEventDurationsMeta.title,
    component: EditEventDurationsBasic,
    args: EditEventDurationsMeta.args
  }
  // Add more stories here...
]

const CustomStorybookUI = () => {
  const [isFontsLoaded, error] = useAppFonts()
  const [selectedStory, setSelectedStory] = useState(1)

  console.error(error)
  //REMEMBER TO UNCOMMENT FOR PREVIEW
  // if (!isFontsLoaded)
  //   return (
  //     <Text style={{ marginTop: 128 }}>
  //       The fonts did not load. You are trapped here forever!
  //       {JSON.stringify(error)}
  //     </Text>
  //   )

  // Render the selected story
  if (selectedStory !== -1) {
    const { component: StoryComponent, args } = stories[selectedStory]
    return (
      <>
        <StoryComponent {...args} />
      </>
    )
  }
  
}

export default CustomStorybookUI
