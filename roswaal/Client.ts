import { Reassign } from "TiFShared/lib/HelperTypes"
import { TestAppLaunchConfig, launchApp } from "./Launch"
import { RoswaalTestCase, RoswaalTestCaseResult } from "./TestCase"

export type RoswaalClientUploadResults = Reassign<
  RoswaalTestCaseResult,
  "error",
  {
    message: string
    stackTrace?: string
  } | null
>

export class RoswaalClient {
  private readonly results = [] as RoswaalTestCaseResult[]

  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly uploadURL?: string) {}

  async run(
    testCase: RoswaalTestCase,
    launch: (config?: TestAppLaunchConfig) => Promise<void> = launchApp
  ) {
    const result = await testCase.run(launch)
    this.results.push(result)
    if (result.error) throw result.error
  }

  async upload() {
    if (!this.uploadURL) {
      console.warn(
        "No roswaal upload URL specified, test results will not be uploaded. To specify an upload URL, set the ROSWAAL_UPLOAD_RESULTS_URL accordingly."
      )
      return
    }
    const uploadableResults = this.results.map((result) => ({
      ...result,
      error: result.error
        ? { message: result.error.message, stackTrace: result.error.stack }
        : null
    }))
    await fetch(this.uploadURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ results: uploadableResults })
    })
  }
}

export const roswaalClient = new RoswaalClient(
  process.env.ROSWAAL_UPLOAD_RESULTS_URL
)
