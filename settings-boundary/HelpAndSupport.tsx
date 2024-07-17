import { AppStyles } from "@lib/AppColorStyle"
import {
  EmailCompositionResult,
  EmailTemplate,
  TIF_SUPPORT_EMAIL
} from "@lib/EmailComposition"
import { useOpenWeblink } from "@modules/tif-weblinks"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { Alert, StyleProp, ViewStyle } from "react-native"
import { SettingsNavigationLinkView } from "./components/NavigationLink"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsCardSectionView } from "./components/Section"

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
  return `<strong>${name}</strong><br><br><br>` as EmailSection
}

export const HELP_AND_SUPPORT_EMAILS = {
  feedbackSubmitted: email(
    "App Feedback",
    [],
    emailSection(
      "📝 1. Select one or more feedback topics below and provide the necessary details. (Required)"
    ),
    emailSection("a. App functionality (How can the app help you?)"),
    emailSection(
      "b. Creative synergy (Are the features of the app helping you progress?)"
    ),
    emailSection("c. Other feedback (Any other general feedback you have)"),
    emailSection(
      "📸 2. Provide any supplementary information or files related to the feedback above. (Optional)"
    )
  ),
  bugReported: (compileLogsURI?: string) => {
    return email(
      "App Bug Report",
      compileLogsURI ? [compileLogsURI] : [],
      emailSection(
        "🐞 1. Briefly describe the bug and the issues it is causing in the app. (Required)"
      ),
      emailSection(
        "a. Specify the steps that it took for you to get to the bug. (Required)"
      ),
      emailSection(
        "b. What was the expected result supposed to be? (Required)"
      ),
      emailSection(
        "📸 2. Provide any supplementary information or files related to this bug (Optional)."
      )
    )
  },
  questionSubmitted: email(
    "App Question",
    [],
    emailSection(
      "❓ 1. List your question(s) and provide all relevant details. (Required)"
    ),
    emailSection(
      "📸 2. Provide any supplementary information or files related to this question. (Optional)"
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
  reportBugTapped: {
    title: "Attach Logs?",
    description:
      "Adding these logs will help make it easier for us to pinpoint the bug you're having.",
    buttons: (
      reportWithLogs: () => Promise<void>,
      reportWithoutLogs: () => Promise<void>,
      openLogsHelpCenter: () => void
    ) => [
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
  },
  compileLogError: {
    title: "Oops!",
    description:
      "We're sorry, we had an error compiling logs. Sending bug report without logs.",
    buttons: (confirmLogsCompileError: () => void) => [
      {
        text: "OK",
        onPress: confirmLogsCompileError
      }
    ]
  }
}

export const HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS = {
  submitFeedbackSuccess: {
    title: "Received!",
    description:
      "Thank you for submitting your feedback and helping us improve the app. We appreciate your input."
  },
  reportBugSuccess: {
    title: "Received!",
    description:
      "Thank you for reporting this bug and helping us improve the app. We appreciate your input."
  },
  submitQuestionSuccess: {
    title: "Received!",
    description:
      "Thank you for submitting your question. We’ll get back to you shortly. In the meantime, please visit our Help Center for FAQ’s and additional resources."
  }
}

export const HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS = {
  submitFeedbackError: {
    title: "Oops!",
    description:
      "Something went wrong while submitting your feedback. Please try again."
  },
  reportBugError: {
    title: "Oops!",
    description:
      "Something went wrong while reporting this bug. Please try again."
  },
  submitQuestionError: {
    title: "Oops!",
    description:
      "Something went wrong while submitting your question. Please try again."
  }
}

export type EventSettingsProps = {
  style?: StyleProp<ViewStyle>
  state: ReturnType<typeof useHelpAndSupportSettings>
}

export const HelpAndSupportView = ({ style, state }: EventSettingsProps) => (
  <SettingsScrollView style={style}>
    <HelpSectionView state={state} />
  </SettingsScrollView>
)

export type UseHelpAndSupportSettingsEnvironment = {
  isShowingContactSection: () => Promise<boolean>
  compileLogs: () => Promise<string>
  composeEmail: (email: EmailTemplate) => Promise<EmailCompositionResult>
}

export const useHelpAndSupportSettings = (
  env: UseHelpAndSupportSettingsEnvironment
) => {
  const { data: isShowingContactSection } = useQuery(
    ["isMailComposerAvailable"],
    async () => await env.isShowingContactSection(),
    { initialData: true }
  )
  const open = useOpenWeblink()

  return {
    isShowingContactSection,
    feedbackSubmitted: () => {
      createEmail(
        env.composeEmail,
        HELP_AND_SUPPORT_EMAILS.feedbackSubmitted,
        "submitFeedbackSuccess",
        "submitFeedbackError"
      )
    },
    bugReported: () => {
      Alert.alert(
        HELP_AND_SUPPORT_ALERTS.reportBugTapped.title,
        HELP_AND_SUPPORT_ALERTS.reportBugTapped.description,
        HELP_AND_SUPPORT_ALERTS.reportBugTapped.buttons(
          async () => {
            try {
              const URI = await env.compileLogs()
              createEmail(
                env.composeEmail,
                HELP_AND_SUPPORT_EMAILS.bugReported(URI),
                "reportBugSuccess",
                "reportBugError"
              )
            } catch {
              Alert.alert(
                HELP_AND_SUPPORT_ALERTS.compileLogError.title,
                HELP_AND_SUPPORT_ALERTS.compileLogError.description,
                HELP_AND_SUPPORT_ALERTS.compileLogError.buttons(() =>
                  createEmail(
                    env.composeEmail,
                    HELP_AND_SUPPORT_EMAILS.bugReported(undefined),
                    "reportBugSuccess",
                    "reportBugError"
                  )
                )
              )
            }
          },
          async () => {
            await createEmail(
              env.composeEmail,
              HELP_AND_SUPPORT_EMAILS.bugReported(undefined),
              "reportBugSuccess",
              "reportBugError"
            )
          },
          () => open(COMPILING_LOGS_INFO_URL)
        )
      )
    },
    questionSubmitted: () => {
      createEmail(
        env.composeEmail,
        HELP_AND_SUPPORT_EMAILS.questionSubmitted,
        "submitQuestionSuccess",
        "submitQuestionError"
      )
    }
  }
}

export const createEmail = async (
  composeEmail: (email: EmailTemplate) => Promise<EmailCompositionResult>,
  emailTemplate: EmailTemplate,
  successAlerts: keyof typeof HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS,
  failureAlerts: keyof typeof HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS
) => {
  try {
    const status = await composeEmail(emailTemplate)
    if (status === "success") {
      Alert.alert(
        HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS[successAlerts].title,
        HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS[successAlerts].description
      )
    }
  } catch {
    Alert.alert(
      HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS[failureAlerts].title,
      HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS[failureAlerts].description
    )
  }
}

type PresetSectionProps = {
  state: ReturnType<typeof useHelpAndSupportSettings>
}

export const HelpSectionView = ({ state }: PresetSectionProps) => {
  const open = useOpenWeblink()
  return (
    <>
      <SettingsCardSectionView
        title="Help Center"
        subtitle="You can find additional resources and answers to your questions by visiting the Help Center."
      >
        <SettingsNavigationLinkView
          title={"View Help Center"}
          onTapped={() => open("https://www.google.com")}
          iconName="information-circle"
          iconBackgroundColor={AppStyles.black}
        />
      </SettingsCardSectionView>
      {state.isShowingContactSection && (
        <SettingsCardSectionView
          title="Contact Us"
          subtitle="Submit your requests below."
        >
          <SettingsNavigationLinkView
            title="Report a Bug"
            onTapped={state.bugReported}
            iconName="bug"
            iconBackgroundColor={AppStyles.black}
          />
          <SettingsNavigationLinkView
            title="Submit Feedback"
            onTapped={state.feedbackSubmitted}
            iconName="build"
            iconBackgroundColor={AppStyles.black}
          />
          <SettingsNavigationLinkView
            title="Ask Question"
            onTapped={state.questionSubmitted}
            iconName="help-circle"
            iconBackgroundColor={AppStyles.black}
          />
        </SettingsCardSectionView>
      )}
    </>
  )
}
