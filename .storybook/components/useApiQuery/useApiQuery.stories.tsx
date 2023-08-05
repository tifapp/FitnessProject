import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { ExampleQuery } from "./useApiQueryExample"

const useApiQueryMeta: ComponentMeta<typeof ExampleQuery> = {
  title: "IconButton",
  component: ExampleQuery,
  argTypes: {
    onPress: { action: "pressed the button" }
  }
}

export default ExampleQuery

type ApiQueryStory = ComponentStory<typeof ExampleQuery>

export const Success: ApiQueryStory = (args) => <ExampleQuery />
