import React, { useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"

// Import your stories
import { MyButtonProps } from ".storybook/components/Button/Button"
import { FlatList } from "react-native-gesture-handler"
import MyButtonMeta, {
  Basic as MyButtonBasic
} from "../components/Button/Button.stories"
import ContentReportingMeta, {
  Default as DefaultReportingFlow
} from "../components/ContentReporting/ContentReporting.stories"
import { useAppFonts } from "../../hooks/Fonts"

// Create an array of stories
const stories = [
  {
    name: MyButtonMeta.title,
    component: MyButtonBasic,
    args: MyButtonMeta.args as MyButtonProps
  },
  {
    name: ContentReportingMeta.title,
    component: DefaultReportingFlow,
    args: ContentReportingMeta.args
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
