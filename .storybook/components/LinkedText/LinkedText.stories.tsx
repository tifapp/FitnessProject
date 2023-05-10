import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useState } from "react"
import IconButton from "../../../components/common/IconButton"
import { View } from "react-native"
import { LinkedText } from "@components/LinkedText"
import { TextInput } from "react-native-gesture-handler"

const StoryText = () => {
  const [text, setText] = useState("")
  return (
    <View
      style={{ height: "100%", justifyContent: "center", alignItems: "center" }}
    >
      <LinkedText style={{ width: "100%" }} text={text} />
      <TextInput multiline style={{ width: "100%" }} onChangeText={setText}>
        <LinkedText text={text} />
      </TextInput>
    </View>
  )
}

const LinkedTextMeta: ComponentMeta<typeof StoryText> = {
  title: "LinkedText",
  component: StoryText
}

export default LinkedTextMeta

type LinkedTextStory = ComponentStory<typeof StoryText>

export const Basic: LinkedTextStory = () => <StoryText />
