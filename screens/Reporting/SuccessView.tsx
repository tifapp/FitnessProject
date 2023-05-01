import React from "react"
import { Button, StyleProp, View, ViewStyle } from "react-native"

export type ReportSuccessProps = {
  onDoneTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const ReportSuccessView = ({
  onDoneTapped,
  style
}: ReportSuccessProps) => (
  <View style={style}>
    <Button title="Done" onPress={onDoneTapped} />
  </View>
)
