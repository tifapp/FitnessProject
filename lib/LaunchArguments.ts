import { CognitoAccessToken } from "amazon-cognito-identity-js"
import { LaunchArguments as RNLaunchArguements } from "react-native-launch-arguments"
import { z } from "zod"

export const LaunchArgumentsSchema = z
  .object({
    apiURL: z
      .string()
      .url()
      .transform((url) => new URL(url)),
    testCognitoUserToken: z
      .string()
      .transform((AccessToken) => new CognitoAccessToken({ AccessToken }))
  })
  .partial()

export type LaunchArguments = z.rInfer<typeof LaunchArgumentsSchema>

/**
 * Launch arguments that can be configured for acceptance testing.
 */
export type ConfigurableTestLaunchArguments = Omit<LaunchArguments, "apiURL">

/**
 * The current run's launch arguments.
 */
export const launchArguments = LaunchArgumentsSchema.parse(
  RNLaunchArguements.value()
)
