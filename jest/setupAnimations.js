// https://docs.swmansion.com/react-native-reanimated/docs/guides/testing/
import { TEST_FRAME_TIME } from "@test-helpers/FakeTimeInterval"
import { setUpTests } from "react-native-reanimated"

setUpTests()

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper")

// @ts-ignore //https://stackoverflow.com/questions/42268673/jest-test-animated-view-for-react-native-app
global.requestAnimationFrame = (cb) => {
  // Default implementation of requestAnimationFrame calls setTimeout(cb, 0),
  // which will result in a cascade of timers - this generally pisses off test runners
  // like Jest who watch the number of timers created and assume an infinite recursion situation
  // if the number gets too large.
  //
  // Setting the timeout simulates a frame every 1/100th of a second
  setTimeout(cb, TEST_FRAME_TIME)
}
