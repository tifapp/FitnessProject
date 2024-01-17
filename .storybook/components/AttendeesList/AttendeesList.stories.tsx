import { Headline } from "@components/Text"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"

const SomeComponent = (props: any) => <></>

const AttendeesListMeta: ComponentMeta<typeof SomeComponent> = {
  title: "Attendees List"
}
export default AttendeesListMeta

type AttendeesListStory = ComponentStory<typeof SomeComponent>

export const Basic: AttendeesListStory = () => (
  <TiFQueryClientProvider>
    <Headline>Hello world</Headline>
  </TiFQueryClientProvider>
)
