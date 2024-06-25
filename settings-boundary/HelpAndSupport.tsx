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
  featureRequested: {
    recipients: ["TIF@myspace.com"],
    subject: "Request for Feature",
    body: "I want to request a feature for the app!"
  },
  bugReported: (compileLogsURI?: string) => ({
    recipients: ["TIF@myspace.com"],
    subject: "Bug Report",
    body: "There's a bug here in the app!",
    attachments: compileLogsURI ? [compileLogsURI] : undefined
  })
}

export const HELP_AND_SUPPORT_ALERTS = {
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
  reportBugSuccess: {
    title: "Success!",
    description: "We received your feedback! Thank you for supporting the app!"
  },
  reportBugError: {
    title: "Error",
    description: "We're sorry, we had an error receiving your request."
  },
  compileLogError: {
    title: "Error",
    description:
      "We're sorry, we had an error compiling logs. Sending bug report without logs.",
    buttons: (confirmLogsCompileError: () => void) => [
      {
        text: "OK",
        onPress: confirmLogsCompileError
      }
    ]
  },
  requestFeatureSuccess: {
    title: "Success!",
    description: "We received your request! Thank you for supporting the app!"
  },
  requestFeatureError: {
    title: "Error",
    description: "We're sorry, we had an error receiving your request."
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
    featureRequested: async () => {
      try {
        const status = await env.composeEmail(
          HELP_AND_SUPPORT_EMAILS.featureRequested
        )
        if (status === "success") {
          Alert.alert(
            HELP_AND_SUPPORT_ALERTS.requestFeatureSuccess.title,
            HELP_AND_SUPPORT_ALERTS.requestFeatureSuccess.description
          )
        }
      } catch {
        Alert.alert(
          HELP_AND_SUPPORT_ALERTS.requestFeatureError.title,
          HELP_AND_SUPPORT_ALERTS.requestFeatureError.description
        )
      }
    },
    bugReported: async () => {
      Alert.alert(
        HELP_AND_SUPPORT_ALERTS.reportBugTapped.title,
        HELP_AND_SUPPORT_ALERTS.reportBugTapped.description,
        HELP_AND_SUPPORT_ALERTS.reportBugTapped.buttons(
          async () => {
            await env
              .compileLogs()
              .then(async (URI) => {
                try {
                  const status = await env.composeEmail(
                    HELP_AND_SUPPORT_EMAILS.bugReported(URI)
                  )
                  if (status === "success") {
                    Alert.alert(
                      HELP_AND_SUPPORT_ALERTS.reportBugSuccess.title,
                      HELP_AND_SUPPORT_ALERTS.reportBugSuccess.description
                    )
                  }
                } catch {
                  Alert.alert(
                    HELP_AND_SUPPORT_ALERTS.reportBugError.title,
                    HELP_AND_SUPPORT_ALERTS.reportBugError.description
                  )
                }
              })
              .catch(() =>
                Alert.alert(
                  HELP_AND_SUPPORT_ALERTS.compileLogError.title,
                  HELP_AND_SUPPORT_ALERTS.compileLogError.description,
                  HELP_AND_SUPPORT_ALERTS.compileLogError.buttons(async () =>
                    noLogsBugReport(env.composeEmail)
                  )
                )
              )
          },
          async () => {
            noLogsBugReport(env.composeEmail)
          },
          () => open(COMPILING_LOGS_INFO_URL)
        )
      )
    }
  }
}

const noLogsBugReport = async (
  composeEmail: (email: EmailTemplate) => Promise<EmailCompositionResult>
) => {
  try {
    const status = await composeEmail(
      HELP_AND_SUPPORT_EMAILS.bugReported(undefined)
    )
    if (status === "success") {
      Alert.alert(
        HELP_AND_SUPPORT_ALERTS.reportBugSuccess.title,
        HELP_AND_SUPPORT_ALERTS.reportBugSuccess.description
      )
    }
  } catch {
    Alert.alert(
      HELP_AND_SUPPORT_ALERTS.reportBugError.title,
      HELP_AND_SUPPORT_ALERTS.reportBugError.description
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
        subtitle="This is the hub for any help you may want, or reports or feedback you might have about the app."
      >
        <SettingsNavigationLinkView
          title={"View Help Center"}
          onTapped={() => open("https://www.google.com")}
          iconName={"help-circle"}
          iconBackgroundColor={AppStyles.black}
        />
      </SettingsCardSectionView>
      {state.isShowingContactSection && (
        <SettingsCardSectionView
          title="Contact Us"
          subtitle="Feel free to talk to us about anything you might be feeling about the app!"
        >
          <SettingsNavigationLinkView
            title={"Report a Bug"}
            onTapped={state.bugReported}
            iconName={"bug"}
            iconBackgroundColor={AppStyles.black}
          />
          <SettingsNavigationLinkView
            title={"Request a Feature"}
            onTapped={state.featureRequested}
            iconName={"build"}
            iconBackgroundColor={AppStyles.black}
          />
        </SettingsCardSectionView>
      )}
    </>
  )
}
