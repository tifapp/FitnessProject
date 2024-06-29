import { AppStyles } from "@lib/AppColorStyle"
import { EmailCompositionResult, EmailTemplate } from "@lib/EmailComposition"
import { useOpenWeblink } from "@modules/tif-weblinks"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { Alert, StyleProp, ViewStyle } from "react-native"
import { SettingsNavigationLinkView } from "./components/NavigationLink"
import { SettingsScrollView } from "./components/ScrollView"
import { SettingsCardSectionView } from "./components/Section"

export const COMPILING_LOGS_INFO_URL = "https://logs.com"

export const HELP_AND_SUPPORT_EMAILS = {
  feedbackSubmitted: {
    recipients: ["TIF@myspace.com"],
    subject: "App Feedback",
    body: "Please provide detailed feedback on the app below, including suggestions for app improvements or any other feedback you have."
  },
  bugReported: (compileLogsURI?: string) => ({
    recipients: ["TIF@myspace.com"],
    subject: "App Bug Report",
    body: "Please provide a detailed explanation of the bug below, including all relevant information pertaining to it",
    attachments: compileLogsURI ? [compileLogsURI] : undefined
  }),
  questionSubmitted: {
    recipients: ["TIF@myspace.com"],
    subject: "App Question",
    body: "Please list your question below and include all necessary details so that we can respond effectively."
  }
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
      logQuestion: () => void
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
        onPress: logQuestion
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
    feedbackSubmitted: async () => {
      createEmail(
        env.composeEmail,
        HELP_AND_SUPPORT_EMAILS.feedbackSubmitted,
        "submitFeedbackSuccess",
        "submitFeedbackError"
      )
    },
    bugReported: async () => {
      Alert.alert(
        HELP_AND_SUPPORT_ALERTS.reportBugTapped.title,
        HELP_AND_SUPPORT_ALERTS.reportBugTapped.description,
        HELP_AND_SUPPORT_ALERTS.reportBugTapped.buttons(
          async () => {
            try {
              const URI = await env.compileLogs()
              if (URI) {
                createEmail(
                  env.composeEmail,
                  HELP_AND_SUPPORT_EMAILS.bugReported(URI),
                  "reportBugSuccess",
                  "reportBugError"
                )
              }
            } catch {
              Alert.alert(
                HELP_AND_SUPPORT_ALERTS.compileLogError.title,
                HELP_AND_SUPPORT_ALERTS.compileLogError.description,
                HELP_AND_SUPPORT_ALERTS.compileLogError.buttons(async () =>
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
            createEmail(
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
    questionSubmitted: async () => {
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
          iconName={"information-circle"}
          iconBackgroundColor={AppStyles.black}
        />
      </SettingsCardSectionView>
      {state.isShowingContactSection && (
        <SettingsCardSectionView
          title="Contact Us"
          subtitle="Submit your requests below."
        >
          <SettingsNavigationLinkView
            title={"Report a Bug"}
            onTapped={state.bugReported}
            iconName={"bug"}
            iconBackgroundColor={AppStyles.black}
          />
          <SettingsNavigationLinkView
            title={"Submit Feedback"}
            onTapped={state.feedbackSubmitted}
            iconName={"build"}
            iconBackgroundColor={AppStyles.black}
          />
          <SettingsNavigationLinkView
            title={"Submit Feedback"}
            onTapped={state.questionSubmitted}
            iconName={"help-circle"}
            iconBackgroundColor={AppStyles.black}
          />
        </SettingsCardSectionView>
      )}
    </>
  )
}
