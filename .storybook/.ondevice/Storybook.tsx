import React, { useState } from "react"
import { Text } from "react-native"
import { useAppFonts } from "../../lib/Fonts"

// Import your stories
import { setupCognito } from "@auth-boundary/CognitoHelpers"
import { InMemorySecureStore } from "@auth-boundary/CognitoSecureStorage"
import { sqliteLogHandler, sqliteLogs } from "@lib/Logging"
import { dayjs } from "TiFShared/lib/Dayjs"
import { addLogHandler, consoleLogHandler } from "TiFShared/logging"
import RegionMonitoringMeta, {
  Basic as RegionMonitoringBasic
} from "../components/RegionMonitoring/RegionMonitoring.stories"

setupCognito(new InMemorySecureStore())
addLogHandler(consoleLogHandler())
addLogHandler(
  sqliteLogHandler(sqliteLogs, dayjs.duration(2, "weeks").asSeconds())
)

// Create an array of stories
const story = {
  name: RegionMonitoringMeta.title,
  component: RegionMonitoringBasic,
  args: RegionMonitoringMeta.args
}

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

  const { component: StoryComponent, args } = story
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

export default CustomStorybookUI
