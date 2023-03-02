import React, { ReactNode } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { useToolbar } from "./ToolbarProvider"

export type ToolbarSectionProps = {
  title: string
  children: ReactNode
}

export const ToolbarSectionView = ({
  title,
  children
}: ToolbarSectionProps) => {
  const { dismissCurrentSection } = useToolbar()
  return (
    <View>
      <TouchableOpacity
        accessibilityLabel="Close Section"
        onPress={dismissCurrentSection}
      />
      <Text>{title}</Text>
      {children}
    </View>
  )
}
