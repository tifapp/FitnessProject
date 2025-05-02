import { StoryMeta } from ".storybook/HelperTypes"
import { ReportFormView } from "@content-reporting-boundary"
import React from "react"

const TestScreen = () => (
  <ReportFormView contentType="event" onSubmitted={async () => {}} />
)

const ContentReportingMeta: StoryMeta = {
  title: "Content Reporting",
  component: TestScreen
}

export default ContentReportingMeta

export const Default = () => <TestScreen />
