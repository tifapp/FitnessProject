import React, { useState } from "react"
import {
  ShadedTextField,
  PasswordTextField,
  TextField
} from "@components/TextFields"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { Button, KeyboardAvoidingView, View } from "react-native"
import { ContentText } from "@content-formatting"
import { Ionicon } from "@components/common/Icons"

const TextFieldMeta: ComponentMeta<typeof TextField> = {
  title: "TextFields",
  component: TextField
}

export default TextFieldMeta

type TextFieldStory = ComponentStory<typeof TextField>

export const Basic: TextFieldStory = () => (
  <KeyboardAvoidingView
    behavior="padding"
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
    <Password />
    <Filled />
  </KeyboardAvoidingView>
)

const Standard = () => {
  const [text, setText] = useState("")
  return (
    <TextField value={text} onChangeText={setText} style={{ padding: 16 }} />
  )
}

const LeftAddon = () => {
  const [text, setText] = useState("")
  return (
    <TextField
      leftAddon={<Ionicon name="close-circle" />}
      placeholder="Enter Text"
      style={{ padding: 16 }}
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
      style={{ padding: 16 }}
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
      style={{ padding: 16 }}
      error={
        <ContentText
          text="@die"
          onUserHandleTapped={() => {}}
          onEventHandleTapped={() => {}}
        />
      }
    />
  )
}

const Password = () => {
  const [text, setText] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  return (
    <View style={{ width: "100%" }}>
      <PasswordTextField
        value={text}
        placeholder="Enter Text"
        onChangeText={setText}
        style={{ padding: 16 }}
      />
      <Button title="Toggle Focus" onPress={() => setIsFocused((f) => !f)} />
    </View>
  )
}

const Filled = () => {
  const [text, setText] = useState("")
  return (
    <ShadedTextField
      value={text}
      placeholder="Enter Text"
      onChangeText={setText}
      style={{ padding: 16 }}
      error="This is an error"
    />
  )
}
