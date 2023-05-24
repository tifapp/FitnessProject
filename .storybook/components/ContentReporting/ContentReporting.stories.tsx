import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { uuid } from "@lib/uuid"
import { NavigationContainer } from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { Button } from "react-native"
import {
  ReportingScreensParamsList,
  createContentReportingStackScreens
} from "../../../screens/Reporting"

type ParamsList = { test: undefined } & ReportingScreensParamsList

const Stack = createStackNavigator<ParamsList>()

const reportingScreens = createContentReportingStackScreens<ParamsList>(
  Stack,
  () => {
    throw new Error()
  }
)

const Screen = ({ navigation }: StackScreenProps<ParamsList, "test">) => (
  <Button
    title="Go to report thing"
    onPress={() =>
      navigation.navigate("reportContent", {
        contentType: "event",
        contentId: uuid()
      })
    }
  />
)

const TestScreen = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
      <Stack.Screen name="test" component={Screen} />
      {reportingScreens}
    </Stack.Navigator>
  </NavigationContainer>
)

const ContentReportingMeta: ComponentMeta<typeof TestScreen> = {
  title: "Content Reporting",
  component: TestScreen
}

export default ContentReportingMeta

type ContentReportingStory = ComponentStory<typeof TestScreen>

export const Default: ContentReportingStory = () => <TestScreen />
