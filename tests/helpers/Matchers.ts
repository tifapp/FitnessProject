/* eslint-disable no-unused-vars */
import { ReactTestInstance } from "react-test-renderer"

interface CustomMatchers<R = unknown> {
  /**
   * Tests whether a `ReactTestInstance` is on screen or not.
   */
  toBeDisplayed(): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

expect.extend({
  toBeDisplayed (value: ReactTestInstance | null) {
    // TODO: - Better messages
    if (!value) {
      return {
        pass: false,
        message: () => "The component was not found on the screen."
      }
    }
    return {
      pass: true,
      message: () => "The component was found on the screen."
    }
  }
})
