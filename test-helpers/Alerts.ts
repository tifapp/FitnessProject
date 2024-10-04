/* global jest */
import { Alert } from "@lib/Alerts"
import { act } from "@testing-library/react-native"
import { Alert as RNAlert, AlertButton } from "react-native"
import { diff } from "jest-diff"

interface CustomMatchers<R = unknown> {
  toHaveBeenPresentedWith(alert: Alert): R
  toHaveBeenNthPresentedWith(n: number, alert: Alert): R
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

expect.extend({
  toHaveBeenPresentedWith(spy: jest.Mock, alert: Alert) {
    const calls = spy.mock.calls as AlertCall[]
    if (calls.length === 0) {
      return {
        pass: false,
        message: () => "No Alerts have been presented."
      }
    }
    const comparableAlert = { ...alert, buttons: removeOnPress(alert.buttons) }
    const call = calls.find((call) => {
      return this.equals(comparableAlert, comparableAlertFromCall(call))
    })
    if (call) return { pass: true, message: () => "Alert was presented." }
    return {
      pass: false,
      message: () => {
        return (
          diff(
            comparableAlert,
            comparableAlertFromCall(calls[calls.length - 1])
          ) ?? "No Diff"
        )
      }
    }
  },
  toHaveBeenNthPresentedWith(spy: jest.Mock, n: number, alert: Alert) {
    const calls = spy.mock.calls as AlertCall[]
    const index = n - 1
    if (calls.length === 0) {
      return {
        pass: false,
        message: () => "No Alerts have been presented."
      }
    }
    if (calls.length < n) {
      return {
        pass: false,
        message: () => `Less than ${n} alerts have been presented.`
      }
    }
    const comparableAlert = { ...alert, buttons: removeOnPress(alert.buttons) }
    const callAlert = comparableAlertFromCall(calls[index])
    if (this.equals(comparableAlert, callAlert)) {
      return { pass: true, message: () => "Alert was presented." }
    }
    return {
      pass: false,
      message: () => diff(comparableAlert, callAlert) ?? "No Diff"
    }
  }
})

type AlertCall = [string, string | undefined, AlertButton[] | undefined]

const comparableAlertFromCall = (call: AlertCall) => ({
  title: call[0],
  description: call[1],
  buttons: removeOnPress(call[2])
})

const removeOnPress = (buttons: AlertButton[] | undefined) => {
  if (!buttons) return undefined
  return buttons.map((button) => {
    const newButton = { ...button }
    delete newButton.onPress
    return newButton
  })
}

/**
 * Mocks alerts in a friendly way for testing.
 *
 * Mostly copied from: https://github.com/callstack/react-native-testing-library/issues/218
 */
export const captureAlerts = () => {
  const alertPresentationSpy = jest.spyOn(RNAlert, "alert")

  let dismissedCalls: ReadonlyArray<
    Readonly<[string, string, ReadonlyArray<AlertButton>]>
  > = []
  return {
    alertPresentationSpy,
    tapAlertButton: async (text: string) => {
      // @ts-ignore
      const unhandledCalls = RNAlert.alert.mock.calls.slice()
      dismissedCalls.forEach((call) => {
        // Only want to remove the first instance in case there are multiple identical calls
        const index = unhandledCalls.indexOf(call)
        dismissedCalls = dismissedCalls.filter((_, i) => i !== index)
      })

      if (unhandledCalls.length === 0) {
        throw new Error("No pending calls to alert")
      }

      const mostRecentCall = unhandledCalls[unhandledCalls.length - 1]

      // TODO: Handle default button case, when no buttons provided
      const targetButton = mostRecentCall[2].find(
        (button: AlertButton) => button.text === text
      )

      if (!targetButton) {
        throw new Error(`No button with text ${text}`)
      }

      if (targetButton.onPress) {
        await act(async () => await targetButton.onPress())
      }

      dismissedCalls = [...dismissedCalls, mostRecentCall]
    }
  }
}
