import { CognitoAccessToken } from "amazon-cognito-identity-js"
import { LaunchArguments as RNLaunchArguements } from "react-native-launch-arguments"
import { z } from "zod"

export const RawLaunchArgumentsSchema = z
  .object({
    apiURL: z.string().url(),
    testCognitoUserToken: z.string()
  })
  .partial()

/**
 * A primitive form of {@link LaunchArguments}.
 */
export type RawLaunchArguments = z.rInfer<typeof RawLaunchArgumentsSchema>

/**
 * Launch arguments that can be configured for acceptance testing.
 */
export type ConfigurableTestRawLaunchArguments = Omit<
  RawLaunchArguments,
  "apiURL"
>

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
 * The current run's launch arguments.
 */
export const launchArguments = LaunchArgumentsSchema.parse(
  RNLaunchArguements.value()
)
