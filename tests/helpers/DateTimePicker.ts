import { fireEvent, screen } from "@testing-library/react-native"
import * as DateTimePickerModule from "@react-native-community/datetimepicker"
import { Platform } from "react-native"

type SetDateTimePickerDateArgs = {
  testID: string
  toDate: Date
}

/**
 * Use this when you need to select a date on a component that uses
 * `DateTimePicker` in a test.
 *
 * The `DateTimePicker` component must have a `testID` prop attached to it.
 */
export const setDateTimePickerDate = (args: SetDateTimePickerDateArgs) => {
  if (Platform.OS === "ios") {
    iOSSetDateTimePickerDate(args)
  } else {
    androidSetDateTimePickerDate(args)
  }
}

const androidSetDateTimePickerDate = ({
  testID,
  toDate: date
}: SetDateTimePickerDateArgs) => {
  const mock = jest
    .spyOn(DateTimePickerModule.DateTimePickerAndroid, "open")
    .mockImplementation(({ onChange }) => {
      onChange?.(nativeEvent(date), date)
    })
  fireEvent.press(screen.getByTestId(testID))
  mock.mockRestore()
}

const iOSSetDateTimePickerDate = ({
  testID,
  toDate: date
}: SetDateTimePickerDateArgs) => {
  fireEvent(pickerWithTestId(testID), "onChange", nativeEvent(date), date)
}

const nativeEvent = (date: Date) => ({
  type: "set" as DateTimePickerModule.EvtTypes,
  nativeEvent: { timestamp: date.getTime() }
})

// See: https://github.com/react-native-datetimepicker/datetimepicker/blob/master/test/userlandTestExamples.test.js
const pickerWithTestId = (testId: string) => {
  const picker = screen
    .UNSAFE_getAllByType(DateTimePickerModule.default)
    .find((picker) => picker.props.testID === testId)
  if (!picker) {
    throw new Error(`Could not find a DateTimePicker with testID=${testId}`)
  }
  return picker
}
