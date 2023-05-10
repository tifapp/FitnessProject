import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useState } from "react"
import IconButton from "../../../components/common/IconButton"
import { View } from "react-native"
import { ContentText } from "@components/ContentText"
import { TextInput } from "react-native-gesture-handler"

const StoryText = () => {
  const [text, setText] = useState("")
  return (
    <View
      style={{ height: "100%", justifyContent: "center", alignItems: "center" }}
    >
      <ContentText style={{ width: "100%" }} text={text} />
      <TextInput multiline style={{ width: "100%" }} onChangeText={setText}>
        <ContentText text={text} />
      </TextInput>
    </View>
  )
}

const ContentTextMeta: ComponentMeta<typeof StoryText> = {
  title: "LinkedText",
  component: StoryText
}

export default ContentTextMeta

type ContentTextStory = ComponentStory<typeof StoryText>

export const Basic: ContentTextStory = () => <StoryText />
