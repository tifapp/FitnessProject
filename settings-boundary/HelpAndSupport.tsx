import { TiFFormNavigationLinkView } from "@components/form-components/NavigationLink"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import { TiFFormCardSectionView } from "@components/form-components/Section"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { AppStyles } from "@lib/AppColorStyle"
import {
  EmailCompositionResult,
  EmailTemplate,
  presentEmailComposer,
  TIF_SUPPORT_EMAIL
} from "@lib/EmailComposition"
import { featureContext } from "@lib/FeatureContext"
import { compileLogs } from "@lib/Logging"
import { UserInfoEmailFileFeature } from "@lib/UserInfoEmailFile"
import { useOpenWeblink } from "@modules/tif-weblinks"
import { useQuery } from "@tanstack/react-query"
import { isAvailableAsync } from "expo-mail-composer"
import React from "react"
import { Platform, StyleProp, ViewStyle } from "react-native"
import { UserID } from "TiFShared/domain-models/User"

export const COMPILING_LOGS_INFO_URL = "https://logs.com"

type EmailSection = string & { _tag: "help-and-support-email-section" }

const email = (
  subject: string,
  attachments: string[],
  ...sections: EmailSection[]
) => ({
  recipients: [TIF_SUPPORT_EMAIL],
  subject,
  body: sections.join("\n"),
  attachments,
  isHtml: true
})

const emailSection = (name: string) => {
  return Platform.OS === "android"
    ? (`<strong>${name}</strong><br><br><br><br><br><br>` as EmailSection)
    : (`<strong>${name}</strong><br><br><br>` as EmailSection)
}

export const HELP_AND_SUPPORT_EMAILS = {
  feedbackSubmitted: (tempUserIDURI?: string) =>
    email(
      "App Feedback",
      tempUserIDURI ? [tempUserIDURI] : [],
      emailSection(
        "📝 Select one or more feedback topics below and provide the necessary details. (Required)"
      ),
      emailSection("a. App functionality (How could the app help you?)"),
      emailSection(
        "b. Creative synergy (Are the features of the app helping you progress?)"
      ),
      emailSection("c. Other feedback (Any other general feedback you have)"),
      emailSection(
        "📸 Provide any supplementary information or files related to the feedback above. (Optional)"
      )
    ),
  bugReported: (attachments?: string[]) => {
    return email(
      "App Bug Report",
      attachments || [],
      emailSection(
        "🐞 Briefly describe the bug and the issues it is causing in the app. (Required)"
      ),
      emailSection(
        "a. Specify the steps that it took for you to get to the bug. (Required)"
      ),
      emailSection("b. What did you expect to happen? (Required)"),
      emailSection(
        "📸 Provide any supplementary information or screenshots related to the feedback above. (Optional)"
      )
    )
  },
  questionSubmitted: (tempUserIDURI?: string) =>
    email(
      "App Question",
      tempUserIDURI ? [tempUserIDURI] : [],
      emailSection(
        "❓ List your question(s) and provide all relevant details. (Required)"
      ),
      emailSection(
        "📸 Provide any supplementary information or screenshots related to these question(s). (Optional)"
      )
    )
}

export const HELP_AND_SUPPORT_ALERTS = {
  submitFeedbackSuccess: {
    title: "Received!",
    description:
      "Thank you for submitting your feedback and helping us improve the app. We appreciate your input."
  },
  submitFeedbackError: {
    title: "Oops!",
    description:
      "Something went wrong while submitting your feedback. Please try again."
  },
  reportBugTapped: (
    reportWithLogs?: () => Promise<void>,
    reportWithoutLogs?: () => Promise<void>,
    openLogsHelpCenter?: () => void
  ) => ({
    title: "Attach Logs?",
    description:
      "Adding these logs will help make it easier for us to pinpoint the bug you're having.",
    buttons: [
      {
        text: "Yes",
        onPress: reportWithLogs
      },
      {
        text: "No",
        style: "cancel" as const,
        onPress: reportWithoutLogs
      },
      {
        text: "What is this?",
        onPress: openLogsHelpCenter
      }
    ]
  }),
  compileLogError: (confirmLogsCompileError?: () => Promise<void>) => ({
    title: "Oops!",
    description:
      "We're sorry, we had an error compiling logs. Sending bug report without logs.",
    buttons: [
      {
        text: "OK",
        onPress: confirmLogsCompileError
      }
    ]
  })
} satisfies AlertsObject

export const HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS = {
  submitFeedback: {
    title: "Received!",
    description:
      "Thank you for submitting your feedback and helping us improve the app. We appreciate your input."
  },
  reportBug: {
    title: "Received!",
    description:
      "Thank you for reporting this bug and helping us improve the app. We appreciate your input."
  },
  submitQuestion: {
    title: "Received!",
    description:
      "Thank you for submitting your question. We’ll get back to you shortly. In the meantime, please visit our Help Center for FAQ’s and additional resources."
  }
} satisfies AlertsObject

export const HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS = {
  submitFeedback: {
    title: "Oops!",
    description:
      "Something went wrong while submitting your feedback. Please try again."
  },
  reportBug: {
    title: "Oops!",
    description:
      "Something went wrong while reporting this bug. Please try again."
  },
  submitQuestion: {
    title: "Oops!",
    description:
      "Something went wrong while submitting your question. Please try again."
  }
} satisfies AlertsObject

export type EventSettingsProps = {
  style?: StyleProp<ViewStyle>
  state: ReturnType<typeof useHelpAndSupportSettings>
}

export const HelpAndSupportView = ({ style, state }: EventSettingsProps) => (
  <TiFFormScrollView style={style}>
    <HelpSectionView state={state} />
  </TiFFormScrollView>
)

export const HelpAndSupportFeature = featureContext({
  isMailComposerAvailable: isAvailableAsync,
  compileLogs,
  composeEmail: presentEmailComposer
})

export type UseHelpAndSupportSettingsEnvironment = {
  userID: UserID
}

export const useHelpAndSupportSettings = (
  env: UseHelpAndSupportSettingsEnvironment
) => {
  const { isMailComposerAvailable, compileLogs, composeEmail } =
    HelpAndSupportFeature.useContext()
  const { createTempIDFile, deleteTempIDFile } =
    UserInfoEmailFileFeature.useContext()
  const { data: isShowingContactSection } = useQuery({
    queryKey: ["isMailComposerAvailable"],
    queryFn: async () => await isMailComposerAvailable(),
    initialData: true
  })
  const open = useOpenWeblink()
  return {
    isShowingContactSection,
    feedbackSubmitted: async () => {
      await tryComposeEmail(
        composeEmail,
        HELP_AND_SUPPORT_EMAILS.feedbackSubmitted(
          await createTempIDFile(env.userID)
        ),
        deleteTempIDFile,
        "submitFeedback"
      )
    },
    bugReported: () => {
      presentAlert(
        HELP_AND_SUPPORT_ALERTS.reportBugTapped(
          async () => {
            try {
              await tryComposeBugReportEmail(
                composeEmail,
                env.userID,
                deleteTempIDFile,
                [await createTempIDFile(env.userID), await compileLogs()]
              )
            } catch {
              presentAlert(
                HELP_AND_SUPPORT_ALERTS.compileLogError(async () => {
                  await tryComposeBugReportEmail(
                    composeEmail,
                    env.userID,
                    deleteTempIDFile,
                    [await createTempIDFile(env.userID)]
                  )
                })
              )
            }
            await deleteTempIDFile()
          },
          async () => {
            await tryComposeBugReportEmail(
              composeEmail,
              env.userID,
              deleteTempIDFile,
              [await createTempIDFile(env.userID)]
            )
          },
          () => open(COMPILING_LOGS_INFO_URL)
        )
      )
    },
    questionSubmitted: async () => {
      await tryComposeEmail(
        composeEmail,
        HELP_AND_SUPPORT_EMAILS.questionSubmitted(
          await createTempIDFile(env.userID)
        ),
        deleteTempIDFile,
        "submitQuestion"
      )
    }
  }
}

const tryComposeBugReportEmail = async (
  composeEmail: (email: EmailTemplate) => Promise<EmailCompositionResult>,
  userID: UserID,
  deleteTempIDFile: () => Promise<void>,
  attachments?: (string | undefined)[]
) => {
  await tryComposeEmail(
    composeEmail,
    HELP_AND_SUPPORT_EMAILS.bugReported(
      attachments ? (attachments.filter(Boolean) as string[]) : undefined
    ),
    deleteTempIDFile,
    "reportBug"
  )
}

const tryComposeEmail = async (
  composeEmail: (email: EmailTemplate) => Promise<EmailCompositionResult>,
  emailTemplate: EmailTemplate,
  deleteTempIDFile: () => Promise<void>,
  alertsKey: keyof typeof HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS
) => {
  try {
    const status = await composeEmail(emailTemplate)
    if (status === "success") {
      presentAlert(HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS[alertsKey])
    }
  } catch {
    presentAlert(HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS[alertsKey])
  }
  await deleteTempIDFile()
}

type PresetSectionProps = {
  state: ReturnType<typeof useHelpAndSupportSettings>
}

const HelpSectionView = ({ state }: PresetSectionProps) => {
  const open = useOpenWeblink()
  return (
    <>
      <TiFFormCardSectionView
        title="Help Center"
        subtitle="You can find additional resources and answers to your questions by visiting the Help Center."
      >
        <TiFFormNavigationLinkView
          title={"View Help Center"}
          onTapped={() => open("https://www.google.com")}
          iconName="information-circle"
          iconBackgroundColor={AppStyles.primary}
        />
      </TiFFormCardSectionView>
      {state.isShowingContactSection && (
        <TiFFormCardSectionView
          title="Contact Us"
          subtitle="Submit your requests below."
        >
          <TiFFormNavigationLinkView
            title="Report a Bug"
            onTapped={state.bugReported}
            iconName="bug"
            iconBackgroundColor={AppStyles.primary}
          />
          <TiFFormNavigationLinkView
            title="Submit Feedback"
            onTapped={state.feedbackSubmitted}
            iconName="build"
            iconBackgroundColor={AppStyles.primary}
          />
          <TiFFormNavigationLinkView
            title="Ask Question"
            onTapped={state.questionSubmitted}
            iconName="help-circle"
            iconBackgroundColor={AppStyles.primary}
          />
        </TiFFormCardSectionView>
      )}
    </>
  )
}
