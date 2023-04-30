import { BodyText } from "@components/Text"
import { ReportingReason } from "@lib/Reporting"
import React from "react"
import {
  StyleProp,
  Touchable,
  TouchableHighlight,
  ViewStyle
} from "react-native"

export type ReportFormProps = {
  onSubmitWithReason: (reason: ReportingReason) => Promise<void>
  style?: StyleProp<ViewStyle>
}

export const ReportFormView = ({
  style,
  onSubmitWithReason
}: ReportFormProps) => {
  return (
    <TouchableHighlight
      onPress={async () => await onSubmitWithReason("harassment")}
      style={style}
    >
      <BodyText>Harassment</BodyText>
    </TouchableHighlight>
  )
}
