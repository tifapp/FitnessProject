import { setupCognito } from "@auth/CognitoHelpers"
import { InMemorySecureStore } from "@auth/CognitoSecureStorage"
import React, { useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { useAppFonts } from "../../lib/Fonts"

// Import your stories
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
import RegionMonitoringMeta, {
  Basic as RegionMonitoringBasic
} from "../components/RegionMonitoring/RegionMonitoring.stories"
import SearchBarMeta, {
  Default as SearchBarBasic
} from "../components/SearchBar/SearchBar.stories"
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
import VerifcationCodeMeta, {
  Basic as VerifcationCodeBasic
} from "../components/VerificationCode/VerifyCode.stories"

setupCognito(new InMemorySecureStore())

// Create an array of stories
const stories = [
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
  }
  // Add more stories here...
]

const CustomStorybookUI = () => {
  const [isFontsLoaded] = useAppFonts()
  const [selectedStory, setSelectedStory] = useState(-1)

  if (!isFontsLoaded) return null

  // Render the selected story
  if (selectedStory !== -1) {
    const { component: StoryComponent, args } = stories[selectedStory]
    return (
      <>
        <StoryComponent {...args} />
        <Text
          onPress={() => setSelectedStory(-1)}
          style={{ position: "absolute", bottom: 10, left: 10 }}
        >
          Close
        </Text>
      </>
    )
  }

  // Render the story list
  return (
    <View style={{ flex: 1, margin: 20 }}>
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
    </View>
  )
}

export default CustomStorybookUI
