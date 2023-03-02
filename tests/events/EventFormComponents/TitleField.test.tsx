import {
  EventForm,
  EventFormTitleField,
  useEventFormContext
} from "@components/eventForm"
import { render, screen } from "@testing-library/react-native"
import React from "react"
import { View } from "react-native"
import { baseTestEventFormValues, editEventTitle } from "./helpers"
import "../../helpers/Matchers"

describe("EventFormTitleField tests", () => {
  it("truncates title at 75 characters", () => {
    renderTitleField()
    editEventTitle("a".repeat(76))
    expect(currentTitle("a".repeat(75))).toBeDisplayed()
  })
})

const renderTitleField = () => {
  return render(
    <EventForm
      initialValues={baseTestEventFormValues}
      onSubmit={jest.fn()}
      onDismiss={jest.fn()}
    >
      <CurrentTitle />
      <EventFormTitleField />
    </EventForm>
  )
}

const CurrentTitle = () => {
  return <View testID={useEventFormContext().watch("title")} />
}

const currentTitle = (title: string) => {
  return screen.queryByTestId(title)
}
