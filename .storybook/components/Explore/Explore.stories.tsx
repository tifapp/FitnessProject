import { ExploreEventsView } from "@screens/ExploreEvents"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"

const ExploreEventsMeta: ComponentMeta<typeof ExploreEventsView> = {
  title: "Explore Events Screen",
  component: ExploreEventsView
}

export default ExploreEventsMeta

type ExploreEventsStory = ComponentStory<typeof ExploreEventsView>

export const Basic: ExploreEventsStory = () => <ExploreEventsView />
