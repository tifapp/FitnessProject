import { BodyText, Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import { TouchableOpacity } from "@gorhom/bottom-sheet"
import { ReportableContentType, ReportingReason } from "@lib/Reporting"
import React, { useState } from "react"
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { Divider } from "react-native-elements"
import { ScrollView } from "react-native-gesture-handler"

type ReportingReasonLabel = {
  reason: ReportingReason
  text: string
}

const REPORTING_REASON_LABELS = [
  { reason: "spam", text: "Spam" },
  { reason: "harassment", text: "Harassment" },
  { reason: "hate-speech", text: "Hate speech" },
  { reason: "violence", text: "Violence" },
  { reason: "scam", text: "Scam or fraud" },
  { reason: "self-harm", text: "Suicide or self-harm" },
  { reason: "misinformation", text: "False Information" },
  {
    reason: "illegally-sold-goods",
    text: "Sale of illegal or regulated goods"
  },
  { reason: "other", text: "Other" }
] as ReportingReasonLabel[]

export type ReportFormProps = {
  contentType: ReportableContentType
  onSubmitted: (reason: ReportingReason) => Promise<void>
  style?: StyleProp<ViewStyle>
}

export const ReportFormView = ({
  style,
  contentType,
  onSubmitted: onSubmitWithReason
}: ReportFormProps) => {
  const [allowSubmissions, setAllowSubmissions] = useState(false)

  const submitReport = async (reason: ReportingReason) => {
    try {
      setAllowSubmissions(true)
      await onSubmitWithReason(reason)
    } catch {
      Alert.alert(
        "Uh Oh",
        "Sorry, something went wrong when submitting your report. Please try again.",
        [
          { text: "Try Again", onPress: () => submitReport(reason) },
          { text: "Ok" }
        ]
      )
      setAllowSubmissions(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={[style, styles.container]}>
      <View style={styles.headerSection}>
        <Headline>Why are you reporting this {contentType}?</Headline>
        <BodyText style={styles.headerDesctiption}>
          Your report is anonymous and not shared with others. If this is a
          critical emergency, call the appropriate authorities immediately -
          don’t wait.
        </BodyText>
      </View>
      <Divider />
      {REPORTING_REASON_LABELS.map((label) => (
        <View key={label.reason}>
          <ReasonOptionView
            disabled={allowSubmissions}
            label={label}
            style={styles.reasonButton}
            onSelected={submitReport}
          />
          <Divider />
        </View>
      ))}
    </ScrollView>
  )
}

type ReasonOptionProps = {
  label: ReportingReasonLabel
  disabled: boolean
  onSelected: (reason: ReportingReason) => Promise<void>
  style?: StyleProp<ViewStyle>
}

const ReasonOptionView = ({
  label,
  disabled,
  onSelected,
  style
}: ReasonOptionProps) => {
  const [isSelected, setIsSelected] = useState(false)

  const reasonTapped = async () => {
    try {
      setIsSelected(true)
      await onSelected(label.reason)
    } finally {
      setIsSelected(false)
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.35}
      testID={label.reason}
      disabled={disabled}
      onPress={() => reasonTapped()}
      style={style}
    >
      <View style={[styles.reasonRow, { opacity: !isSelected ? 1 : 0.35 }]}>
        <BodyText>{label.text}</BodyText>
        <Ionicon name="chevron-forward" style={styles.reasonIcon} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 48
  },
  headerSection: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  headerDesctiption: {
    marginTop: 8,
    opacity: 0.5
  },
  reasonButton: {
    width: "100%"
  },
  reasonRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16
  },
  reasonIcon: {
    opacity: 0.35
  }
})
