import {
  MailComposerOptions,
  MailComposerStatus,
  composeAsync
} from "expo-mail-composer"
import { Platform } from "react-native"

export type EmailCompositionResult =
  | "success"
  | "cancelled"
  | "non-determinable"

export type EmailTemplate = MailComposerOptions

/**
 * Presents the device's email composer with the specified {@link EmailTemplate}, and returns
 * whether or not the user sent an email through the composer's UI.
 *
 * On Android, this always returns `"non-determinable"`.
 */
export const presentEmailComposer = async (
  template: EmailTemplate
): Promise<EmailCompositionResult> => {
  const result = await composeAsync(template)
  if (Platform.OS === "android") return "non-determinable"
  return COMPOSITION_RESULT_MAP[result.status]
}

const COMPOSITION_RESULT_MAP = {
  [MailComposerStatus.SENT]: "success",
  [MailComposerStatus.SAVED]: "cancelled",
  [MailComposerStatus.CANCELLED]: "cancelled",
  [MailComposerStatus.UNDETERMINED]: "non-determinable"
} as const
