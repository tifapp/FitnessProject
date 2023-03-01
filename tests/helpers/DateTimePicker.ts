import { fireEvent, screen } from "@testing-library/react-native"
import RNDateTimePicker from "@react-native-community/datetimepicker"
import { ReactTestInstance } from "react-test-renderer"

/**
 * Use this when you need to select a date on a component that uses
 * `DateTimePicker` in a test.
 *
 * The `DateTimePicker` component must have a `testID` prop attached to it.
 *
 * (**Important Note**): ATM, if `Platform.OS === "android"` in the current test,
 * this will not work.
 */
export const setDateTimePickerDate = ({
  testID,
  toDate: date
}: {
  testID: string
  toDate: Date
}) => {
  // TODO: - Make this support the android modal picker
  fireEvent(
    pickerWithTestId(testID),
    "onChange",
    { event: "set", nativeEvent: { timestamp: date.getTime() } },
    date
  )
}

// See: https://github.com/react-native-datetimepicker/datetimepicker/blob/master/test/userlandTestExamples.test.js
const pickerWithTestId = (testId: string) => {
  const pickerMap = new Map<string, ReactTestInstance>(
    screen.UNSAFE_getAllByType(RNDateTimePicker).map((picker) => {
      return [picker.props.testID, picker]
    })
  )

  const picker = pickerMap.get(testId)
  if (!picker) {
    throw new Error(`Could not find a DateTimePicker with testID=${testId}`)
  }
  return picker
}
