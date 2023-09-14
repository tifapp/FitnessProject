import React, { useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"

// Import your stories
import { FlatList } from "react-native-gesture-handler"
import { useAppFonts } from "../../hooks/Fonts"
import AttendeesListMeta, {
  Basic as AttendeesListScreenBasic
} from "../components/AttendeesList/AttendeesList.stories"
import ContentReportingMeta, {
  Default as DefaultReportingFlow
} from "../components/ContentReporting/ContentReporting.stories"
import ContentTextMeta, {
  Basic as ContentTextBasic
} from "../components/ContentText/ContextText.stories"
import ExploreEventsMeta, {
  Basic as ExploreEventsBasic
} from "../components/Explore/Explore.stories"
import ForgotPasswordMeta, {
  Basic as ForgotPasswordBasic
} from "../components/ForgotPassword/ForgotPasswordForm.stories"
import LocationSearchMeta, {
  Basic as LocationSearchBasic
} from "../components/LocationSearch/LocationSearch.stories"
import SearchBarMeta, {
  Default as SearchBarBasic
} from "../components/SearchBar/SearchBar.stories"
import SettingsMeta, {
  Basic as SettingsScreenBasic
} from "../components/SettingsScreen/SettingsScreen.stories"
import SignUpMeta, {
  Basic as SignUpBasic
} from "../components/SignUp/SignUp.stories"
import TextFieldMeta, {
  Basic as TextFieldBasic
} from "../components/TextField/TextField.stories"
import VerifcationCodeMeta, {
  Basic as VerifcationCodeBasic
} from "../components/VerificationCode/VerifyCode.stories"
import { name } from "dayjs"

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
    name: AttendeesListMeta.title,
    component: AttendeesListScreenBasic,
    args: AttendeesListMeta.args
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
    name: VerifcationCodeMeta.title,
    component: VerifcationCodeBasic,
    args: VerifcationCodeMeta.args
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
