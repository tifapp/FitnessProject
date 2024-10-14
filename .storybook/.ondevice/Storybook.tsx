import React, { useState } from "react"
import { useAppFonts } from "../../lib/Fonts"

// Import your stories
import { setupCognito } from "@auth-boundary/CognitoHelpers"
import { InMemorySecureStore } from "@auth-boundary/CognitoSecureStorage"
import { sqliteLogHandler, sqliteLogs } from "@lib/Logging"
import Game from "Game/Game"
import GameMeta from "Game/Game.stories"
import { dayjs } from "TiFShared/lib/Dayjs"
import { addLogHandler, consoleLogHandler } from "TiFShared/logging"

setupCognito(new InMemorySecureStore())
addLogHandler(consoleLogHandler())
addLogHandler(
  sqliteLogHandler(sqliteLogs, dayjs.duration(2, "weeks").asSeconds())
)

// Create an array of stories
const story = {
  name: GameMeta.title,
  component: Game,
  args: GameMeta.args
}

const CustomStorybookUI = () => {
  const [isFontsLoaded, error] = useAppFonts()
  const [selectedStory, setSelectedStory] = useState(-1)

  console.error(error)
  
  const { component: StoryComponent, args } = story
  return (
    <>
      <StoryComponent {...args} />
    </>
  )
}

export default CustomStorybookUI
