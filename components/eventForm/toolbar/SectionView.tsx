import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { useToolbar } from "./ToolbarProvider"

export type ToolbarSectionProps = {
  title: string
}

export const ToolbarSectionView = ({ title }: ToolbarSectionProps) => {
  const { dismissCurrentSection } = useToolbar()
  return (
    <View>
      <TouchableOpacity
        accessibilityLabel="Close Section"
        onPress={dismissCurrentSection}
      />
      <Text>{title}</Text>
    </View>
  )
}
