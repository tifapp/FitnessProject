import {
  EventForm,
  EventFormColorPicker,
  useEventFormContext
} from "@components/eventForm"
import { HexColor } from "@lib/Color"
import { SetDependencyValue } from "@lib/dependencies"
import { EventColors } from "@lib/events/EventColors"
import { hapticsDependencyKey } from "@lib/Haptics"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { View } from "react-native"
import { baseTestEventFormValues } from "./helpers"
import "../../helpers/Matchers"

describe("EventFormColorPicker tests", () => {
  test("selecting every event color", () => {
    renderColorSection()
    testSelectColor("Blue", EventColors.Blue)
    testSelectColor("Red", EventColors.Red)
    testSelectColor("Pink", EventColors.Pink)
    testSelectColor("Orange", EventColors.Orange)
    testSelectColor("Yellow", EventColors.Yellow)
    testSelectColor("Green", EventColors.Green)
    testSelectColor("Purple", EventColors.Purple)
  })
})

const testSelectColor = (colorName: string, expected: HexColor) => {
  pickColor(colorName)
  expect(selectedColor(expected)).toBeDisplayed()
}

const renderColorSection = () => {
  render(
    <EventForm
      initialValues={baseTestEventFormValues}
      onSubmit={jest.fn()}
      onDismiss={jest.fn()}
    >
      <SelectedColor />
      <SetDependencyValue forKey={hapticsDependencyKey} value={jest.fn()}>
        <EventFormColorPicker />
      </SetDependencyValue>
    </EventForm>
  )
}

const SelectedColor = () => {
  return <View testID={useEventFormContext().watch("color")} />
}

const pickColor = (colorName: string) => {
  fireEvent.press(screen.getByLabelText(colorName))
}

const selectedColor = (color: HexColor) => {
  return screen.queryByTestId(color)
}
