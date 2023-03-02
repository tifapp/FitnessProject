import {
  EventForm,
  EventFormAdvancedSettingsSection,
  useEventFormContext
} from "@components/eventForm"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { View } from "react-native"
import "../../helpers/Matchers"
import { baseTestEventFormValues } from "./helpers"

describe("EventFormAdvancedSettingsSection tests", () => {
  it("should be able to allow hiding after start date setting", () => {
    renderAdvancedSettingsSection({ shouldHideAfterStartDate: false })
    toggleHideSetting(true)
    expect(selectedHideSettingValue(true)).toBeDisplayed()
  })

  it("should be able to disallow hiding after start date setting", () => {
    renderAdvancedSettingsSection({ shouldHideAfterStartDate: true })
    toggleHideSetting(false)
    expect(selectedHideSettingValue(false)).toBeDisplayed()
  })
})

const renderAdvancedSettingsSection = ({
  shouldHideAfterStartDate
}: {
  shouldHideAfterStartDate: boolean
}) => {
  render(
    <EventForm
      initialValues={{ ...baseTestEventFormValues, shouldHideAfterStartDate }}
      onSubmit={jest.fn()}
      onDismiss={jest.fn()}
    >
      <SelectedSettings />
      <EventFormAdvancedSettingsSection />
    </EventForm>
  )
}

const SelectedSettings = () => {
  const hideSetting = useEventFormContext().watch("shouldHideAfterStartDate")
  return <View testID={hideSettingId(hideSetting)} />
}

const hideSettingId = (value: boolean) => `hide-setting-${value}`

const toggleHideSetting = (value: boolean) => {
  fireEvent(screen.getByRole("togglebutton"), "valueChange", value)
}

const selectedHideSettingValue = (selected: boolean) => {
  return screen.queryByTestId(hideSettingId(selected))
}
