import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { Alert } from "react-native"
import {
  EventForm,
  EventFormProps,
  EventFormToolbar
} from "../../../components/eventForm/"
import { dateRange } from "../../../lib/date"
import { EventColors } from "../../../lib/events/EventColors"

const Toolbar = (props: EventFormProps) => {
  return (
    <EventForm {...props}>
      <EventFormToolbar />
    </EventForm>
  )
}

const EventFormToolbarMeta: ComponentMeta<typeof EventForm> = {
  title: "EventFormToolbar",
  component: Toolbar,
  args: {
    initialValues: {
      title: "Test",
      description: "Hello world this is a test.",
      color: EventColors.BrightPink,
      dateRange: dateRange(
        new Date("2023-03-02T08:00:00"),
        new Date("2023-03-02T09:00:00")
      ),
      radiusMeters: 0,
      shouldHideAfterStartDate: false
    },
    onSubmit: async () => {},
    onDismiss: () => {}
  }
}

export default EventFormToolbarMeta

type EventFormToolbarStory = ComponentStory<typeof EventForm>

export const ScrollableToolbar: EventFormToolbarStory = (args) => (
  <Toolbar {...args} />
)
