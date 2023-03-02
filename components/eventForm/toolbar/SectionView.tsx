import React, { ReactNode } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { _useToolbar } from "./ToolbarProvider"

export type _ToolbarSectionProps = {
  title: string
  children: ReactNode
}

export const _ToolbarSectionView = ({
  title,
  children
}: _ToolbarSectionProps) => {
  const { dismissCurrentSection } = _useToolbar()
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
