import { uuid } from "@lib/uuid"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { Button } from "react-native"
import {
  ReportingScreensParamsList,
  createContentReportingStackScreens
} from "../../../screens/Reporting"
import { NavigationContainer } from "@react-navigation/native"

type ParamsList = { test: undefined } & ReportingScreensParamsList

const Stack = createStackNavigator<ParamsList>()

const reportingScreens = createContentReportingStackScreens<ParamsList>(
  Stack,
  () => {
    // NB: - Our backend exploded
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
    <Stack.Navigator>
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
