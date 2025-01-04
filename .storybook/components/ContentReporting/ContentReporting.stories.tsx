import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { ReportFormView } from "@content-reporting-boundary"

const TestScreen = () => (
  <ReportFormView contentType="event" onSubmitted={async () => {}} />
)

const ContentReportingMeta: ComponentMeta<typeof TestScreen> = {
  title: "Content Reporting",
  component: TestScreen
}

export default ContentReportingMeta

type ContentReportingStory = ComponentStory<typeof TestScreen>

export const Default: ContentReportingStory = () => <TestScreen />
