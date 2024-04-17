import { ConfigurableTestLaunchArguments } from "@lib/LaunchArguments"
import { Reassign } from "TiFShared/lib/HelperTypes"
import { device } from "detox"
import { DeviceLaunchAppConfig } from "detox/detox"

export type TestAppLaunchConfig = Reassign<
  DeviceLaunchAppConfig,
  "launchArgs",
  ConfigurableTestLaunchArguments
>

/**
 * Launches the app with the given test configuration.
 */
export const launchApp = async (config?: TestAppLaunchConfig) => {
  await device.launchApp({
    ...config,
    launchArgs: {
      ...config?.launchArgs,
      apiURL: "https://623qsegfb9.execute-api.us-west-2.amazonaws.com/staging/"
    }
  })
}
