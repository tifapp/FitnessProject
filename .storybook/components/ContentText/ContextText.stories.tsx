import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useState } from "react"
import { ContentText, ExpandableContentText } from "@content-parsing"
import { ScrollView, TextInput } from "react-native-gesture-handler"
import { Headline } from "@components/Text"

const StoryText = () => {
  const [text, setText] = useState(
    "Hello world, this is an @event of some kind. Please join it if you like to do nothing. \n\nNow I write this endless storybook story in the void, where \nI can test things like @hello to make sure that links are highlighting and I am not going absolutely crazy."
  )
  return (
    <ScrollView style={{ marginTop: 64 }}>
      <Headline>Expandable Text</Headline>
      <ExpandableContentText
        initialText={text}
        collapsedLineLimit={2}
        onUserHandleTapped={console.log}
        onEventHandleTapped={console.log}
        expandButtonTextStyle={{ color: "red" }}
        style={{ marginBottom: 24, marginTop: 8 }}
      />
      <Headline>No Long Enought Text</Headline>
      <ExpandableContentText
        initialText="Now, for the new event! !17|123/#2BC016/Pickup Basketball"
        collapsedLineLimit={5}
        onUserHandleTapped={console.log}
        onEventHandleTapped={console.log}
      />
      <Headline style={{ marginTop: 24 }}>Text Input</Headline>
      <TextInput multiline style={{ width: "100%" }} onChangeText={setText}>
        <ContentText
          onUserHandleTapped={console.log}
          onEventHandleTapped={console.log}
          text={text}
        />
      </TextInput>
    </ScrollView>
  )
}

const ContentTextMeta: ComponentMeta<typeof StoryText> = {
  title: "Content Text",
  component: StoryText
}

export default ContentTextMeta

type ContentTextStory = ComponentStory<typeof StoryText>

export const Basic: ContentTextStory = () => <StoryText />
