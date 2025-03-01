import React, { useState } from "react"

import MapSnippetMeta, {
  Basic as MapSnippet
} from "../components/MapSnippet/MapSnippet.stories"

import { FlatList, SafeAreaView, Text, TouchableOpacity } from "react-native"
import { useAppFonts } from "../../lib/Fonts"
import awsconfig from "../../src/aws-exports"

// Import your
import { setupCognito } from "@auth-boundary/CognitoHelpers"
import AttendeesListMeta, {
  Basic as AttendeesListBasic
} from "../components/AttendeesList/AttendeesList.stories"
import ButtonsMeta, {
  Basic as ButtonsBasic
} from "../components/Buttons/Buttons.stories"
import ChangePasswordMeta, {
  Basic as ChangePasswordBasic
} from "../components/ChangePassword/ChangePassword.stories"
import ContentReportingMeta, {
  Default as DefaultReportingFlow
} from "../components/ContentReporting/ContentReporting.stories"
import ContentTextMeta, {
  Basic as ContentTextBasic
} from "../components/ContentText/ContextText.stories"
import EventDetailsMeta, {
  Basic as EventDetailsBasic
} from "../components/EventDetails/EventDetails.stories"
import ExploreEventsMeta, {
  Basic as ExploreEventsBasic
} from "../components/Explore/Explore.stories"
import ForgotPasswordMeta, {
  Basic as ForgotPasswordBasic
} from "../components/ForgotPassword/ForgotPasswordForm.stories"
import LocationSearchMeta, {
  Basic as LocationSearchBasic
} from "../components/LocationSearch/LocationSearch.stories"
import NameEntryMeta, {
  Basic as NameEntryBasic
} from "../components/NameEntry/NameEntry.stories"
import ProfileMeta, {
  Basic as ProfileScreenBasic
} from "../components/ProfileScreen/Avatar.stories"
import RegionMonitoringMeta, {
  Basic as RegionMonitoringBasic
} from "../components/RegionMonitoring/RegionMonitoring.stories"
import SearchBarMeta, {
  Default as SearchBarBasic
} from "../components/SearchBar/SearchBar.stories"
import EventSettingsDurationMeta, {
  Basic as EventSettingsDurationBasic
} from "../components/SettingsScreen/EventSettingsDurations.stories"

import { Geo } from "@aws-amplify/geo"
import { sqliteLogHandler, sqliteLogs } from "@lib/Logging"
import { InMemorySecureStore } from "@lib/SecureStore"
import { dayjs } from "TiFShared/lib/Dayjs"
import { addLogHandler, consoleLogHandler } from "TiFShared/logging"
import EditEventDurationsMeta, {
  Basic as EditEventDurationsBasic
} from "../components/EditEvent/DurationPicker.stories"
import EditEventPragmaQuotesMeta, {
  Basic as EditEventPragmaQuotesBasic
} from "../components/EditEvent/PragmaQuote.stories"
import HapticsMeta, {
  Basic as HapticsBasic
} from "../components/Haptics/Haptics.stories"
import RudeusEditorMeta, {
  Basic as RudeusEditorBasic
} from "../components/RudeusEditor/RudeusEditor.stories"
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
import TiFPreviewMeta, {
  Basic as TiFPreviewBasic
} from "../components/TiFPreview/TiFPreview.stories"
import VerifcationCodeMeta, {
  Basic as VerifcationCodeBasic
} from "../components/VerificationCode/VerifyCode.stories"

Geo.configure(awsconfig)
setupCognito(new InMemorySecureStore())
addLogHandler(consoleLogHandler())
addLogHandler(
  sqliteLogHandler(sqliteLogs, dayjs.duration(2, "weeks").asSeconds())
)

// Create an array of stories
const stories = [
  {
    name: MapSnippetMeta.title,
    component: MapSnippet,
    args: MapSnippetMeta.args
  },

  {
    name: NameEntryMeta.title,
    component: NameEntryBasic
  },
  {
    name: ContentReportingMeta.title,
    component: DefaultReportingFlow,
    args: ContentReportingMeta.args
  },
  {
    name: ContentTextMeta.title,
    component: ContentTextBasic,
    args: ContentTextMeta.args
  },
  {
    name: SettingsMeta.title,
    component: SettingsScreenBasic,
    args: ContentTextMeta.args
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
    name: ProfileMeta.title,
    component: ProfileScreenBasic,
    args: ProfileMeta.args
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
    name: VerifcationCodeMeta.title,
    component: VerifcationCodeBasic,
    args: VerifcationCodeMeta.args
  },
  {
    name: ChangePasswordMeta.title,
    component: ChangePasswordBasic,
    args: ChangePasswordMeta.args
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
    args: {}
  },
  {
    name: EditEventPragmaQuotesMeta.title,
    component: EditEventPragmaQuotesBasic,
    args: {}
  },
  {
    name: HapticsMeta.title,
    component: HapticsBasic,
    args: {}
  },
  {
    name: RudeusEditorMeta.title,
    component: RudeusEditorBasic,
    args: {}
  },
  {
    name: TiFPreviewMeta.title,
    component: TiFPreviewBasic,
    args: {}
  }
  // Add more stories here...
]

const CustomStorybookUI = () => {
  const [isFontsLoaded, error] = useAppFonts()
  const [selectedStory, setSelectedStory] = useState(-1)

  console.log(error)
  if (!isFontsLoaded)
    return (
      <Text style={{ marginTop: 128 }}>
        The fonts did not load. You are trapped here forever!
        {JSON.stringify(error)}
      </Text>
    )

  // Render the selected story
  if (selectedStory !== -1) {
    const { component: StoryComponent, args } = stories[selectedStory]
    return (
      <>
        <StoryComponent {...args} />
        <Text
          onPress={() => setSelectedStory(-1)}
          style={{ position: "absolute", bottom: 30, left: 10 }}
        >
          Close
        </Text>
      </>
    )
  }

  // Render the story list
  return (
    <SafeAreaView style={{ flex: 1, margin: 20 }}>
      <FlatList
        data={stories}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{
              padding: 10,
              width: "100%",
              borderWidth: 1,
              borderColor: "gray"
            }}
            key={index}
            onPress={() => setSelectedStory(index)}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

export default CustomStorybookUI
