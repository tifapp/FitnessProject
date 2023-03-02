import {
  EventForm,
  EventFormColorSection,
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

describe("EventFormColorSection tests", () => {
  test("selecting every event color", () => {
    renderColorSection()
    testSelectColor("Blue", EventColors.Blue)
    testSelectColor("Red", EventColors.Red)
    testSelectColor("Cherry Blossom", EventColors.CherryBlossom)
    testSelectColor("Bright Pink", EventColors.BrightPink)
    testSelectColor("Light Blue", EventColors.LightBlue)
    testSelectColor("Orange", EventColors.Orange)
    testSelectColor("Yellow", EventColors.Yellow)
    testSelectColor("Green", EventColors.Green)
    testSelectColor("Turquoise", EventColors.Turquoise)
    testSelectColor("Purple", EventColors.Purple)
    testSelectColor("Light Purple", EventColors.LightPurple)
    testSelectColor("Brown", EventColors.Brown)
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
        <EventFormColorSection />
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
