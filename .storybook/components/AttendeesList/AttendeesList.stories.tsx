import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { AttendeesListScreen } from "@screens/EventAttendeesList/AttendeesListScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"

const AttendeesListMeta: ComponentMeta<typeof AttendeesListScreen> = {
  title: "Attendees List",
  component: AttendeesListScreen
}
export default AttendeesListMeta

type AttendeesListStory = ComponentStory<typeof AttendeesListScreen>

export const Basic: AttendeesListStory = () => (
  <TiFQueryClientProvider>
    <AttendeesListScreen />
  </TiFQueryClientProvider>
)
