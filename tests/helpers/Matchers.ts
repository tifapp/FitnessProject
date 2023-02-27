/* eslint-disable no-unused-vars */
import { ReactTestInstance } from "react-test-renderer"

interface CustomMatchers<R = unknown> {
  /**
   * Tests whether a `ReactTestInstance` is on screen or not.
   */
  toBeDisplayed(): R

  /**
   * Tests whether a component's `disabled` prop is false.
   */
  toBeEnabled(): R
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
      return componentNotFoundResult
    }
    return {
      pass: true,
      message: () => "The component was found on the screen."
    }
  },
  toBeEnabled (value: ReactTestInstance) {
    if (value.props.disabled === undefined) {
      return {
        pass: true,
        message: () => "The component does not have a disabled state."
      }
    }

    if (value.props.disabled) {
      return {
        pass: false,
        message: () => "The component is disabled."
      }
    }

    return { pass: true, message: () => "The component is enabled." }
  }
})

const componentNotFoundResult = {
  pass: false,
  message: () => "The component was not found on the screen."
}
