import React, { useState } from "react"
import { TextField } from "@components/TextFields"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { View } from "react-native"
import { ContentText } from "@components/ContentText"
import { Ionicon } from "@components/common/Icons"

const TextFieldMeta: ComponentMeta<typeof TextField> = {
  title: "TextFields",
  component: TextField
}

export default TextFieldMeta

type TextFieldStory = ComponentStory<typeof TextField>

export const Basic: TextFieldStory = () => (
  <View
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1
    }}
  >
    <Standard />
    <LeftAddon />
    <ErrorString />
    <ErrorView />
  </View>
)

const Standard = () => {
  const [text, setText] = useState("")
  return (
    <TextField
      value={text}
      onChangeText={setText}
      containerStyle={{ padding: 16 }}
    />
  )
}

const LeftAddon = () => {
  const [text, setText] = useState("")
  return (
    <TextField
      leftAddon={<Ionicon name="close-circle" />}
      placeholder="Enter Text"
      containerStyle={{ padding: 16 }}
      value={text}
      onChangeText={setText}
    />
  )
}

const ErrorString = () => {
  const [text, setText] = useState("")
  return (
    <TextField
      value={text}
      placeholder="Enter Text"
      onChangeText={setText}
      containerStyle={{ padding: 16 }}
      error="This is an error..."
    />
  )
}

const ErrorView = () => {
  const [text, setText] = useState("")
  return (
    <TextField
      value={text}
      placeholder="Enter Text"
      onChangeText={setText}
      containerStyle={{ padding: 16 }}
      error={<ContentText text="@die" onUserHandleTapped={() => {}} />}
    />
  )
}
