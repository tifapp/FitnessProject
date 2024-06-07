import { repeatElements } from "TiFShared/lib/Array"
import { TestAppLaunchConfig, launchApp } from "./Launch"

export type RoswaalTestCaseResult = {
  name: string
  actionResults: RoswaalTestCaseActionResult[]
  error: Error | null
}

export type RoswaalTestCaseResultErrorInfo = {
  message: string
  stackTrace: string | undefined
}

export type RoswaalTestCaseActionResult = {
  didPass: boolean
}

/**
 * A class modeling a test case in the roswaal tool.
 *
 * Test cases are constructed with a name and a setup function, then actions are appended to the
 * test. When `run` is called, each action will be ran sequentially, and once either all actions
 * finish, or if an error occurs in any action, then a progress report for the test case is
 * returned.
 *
 * This class generally shouldn't be used outside of generated test code.
 */
export class RoswaalTestCase {
  private readonly actions = [] as (() => Promise<void>)[]

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private readonly name: string,
    private readonly beforeLaunch: () => Promise<TestAppLaunchConfig>
  ) {}

  /**
   * Adds an action to this test case.
   */
  appendAction(action: () => Promise<void>) {
    this.actions.push(action)
  }

  /**
   * Runs all actions sequentially until all are finished, or one errors, and returns an
   * {@link RoswaalTestCaseResult}.
   *
   * If an action fails, then all other subsequent actions automatically are failed.
   *
   * @param launch A function to launch the app given a {@link TestAppLaunchConfig}.
   * @returns A {@link RoswaalTestCaseResult}. The first action returned in the `actionResults`
   * field is the result of the `beforeLaunch` action that was passed in the constructor.
   */
  async run(
    launch: (config?: TestAppLaunchConfig) => Promise<void> = launchApp
  ): Promise<RoswaalTestCaseResult> {
    const beforeLaunchResult = await this.runBeforeLaunch()
    if (beforeLaunchResult instanceof Error || beforeLaunchResult === null) {
      return {
        name: this.name,
        actionResults: repeatElements(this.actions.length + 1, {
          didPass: false
        }),
        error: beforeLaunchResult
      }
    }
    await launch(beforeLaunchResult)
    const actionResults = [{ didPass: true }]
    for (const [index, action] of this.actions.entries()) {
      try {
        await action()
        actionResults.push({ didPass: true })
      } catch (e) {
        const error = e instanceof Error ? e : null
        return {
          name: this.name,
          actionResults: actionResults.concat(
            repeatElements(this.actions.length - index, { didPass: false })
          ),
          error
        }
      }
    }
    return {
      name: this.name,
      actionResults,
      error: null
    }
  }

  private async runBeforeLaunch() {
    try {
      return await this.beforeLaunch()
    } catch (e) {
      return e instanceof Error ? e : null
    }
  }
}
