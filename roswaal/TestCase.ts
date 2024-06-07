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

export class RoswaalTestCase {
  private readonly actions = [] as (() => Promise<void>)[]

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private readonly name: string,
    private readonly beforeLaunch: () => Promise<TestAppLaunchConfig>
  ) {}

  appendAction(action: () => Promise<void>) {
    this.actions.push(action)
  }

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
