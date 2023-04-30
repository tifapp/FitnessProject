import { BodyText } from "@components/Text"
import { ReportingReason } from "@lib/Reporting"
import React from "react"
import {
  Alert,
  StyleProp,
  TouchableHighlight,
  View,
  ViewStyle
} from "react-native"

const REPORTING_REASON_LABELS = [
  { reason: "spam", label: "Spam" },
  { reason: "harassment", label: "Harassment" },
  { reason: "hate-speech", label: "Hate speech" },
  { reason: "violence", label: "Violence" },
  { reason: "scam", label: "Scam or fraud" },
  { reason: "self-harm", label: "Suicide or self-harm" },
  { reason: "misinformation", label: "False Information" },
  {
    reason: "illegally-sold-goods",
    label: "Sale of illegal or regulated goods"
  },
  { reason: "other", label: "Other" }
] as { reason: ReportingReason; label: string }[]

export type ReportFormProps = {
  onSubmitWithReason: (reason: ReportingReason) => Promise<void>
  style?: StyleProp<ViewStyle>
}

export const ReportFormView = ({
  style,
  onSubmitWithReason
}: ReportFormProps) => {
  const resonLabelTapped = async (reason: ReportingReason) => {
    try {
      await onSubmitWithReason(reason)
    } catch {
      Alert.alert(
        "Uh Oh",
        "Sorry, something went wrong when submitting your report. Please try again.",
        [{ text: "Ok" }]
      )
    }
  }

  return (
    <View style={style}>
      {REPORTING_REASON_LABELS.map(({ reason, label }) => (
        <TouchableHighlight
          key={reason}
          onPress={() => resonLabelTapped(reason)}
          style={style}
        >
          <BodyText>{label}</BodyText>
        </TouchableHighlight>
      ))}
    </View>
  )
}
