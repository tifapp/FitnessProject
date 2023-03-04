import React, { ReactNode } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useToolbar } from "./Provider"
import { MaterialIcons } from "@expo/vector-icons"
import { useFontScale } from "@hooks/useFontScale"

export type EventFormToolbarSectionProps = {
  title: string
  children: ReactNode
}

export const EventFormToolbarSection = ({
  title,
  children
}: EventFormToolbarSectionProps) => (
  <View style={styles.container}>
    <View style={styles.headerContainer}>
      <Text maxFontSizeMultiplier={1.5} style={styles.headerText}>
        {title}
      </Text>
      <TouchableOpacity
        accessibilityLabel="Close Section"
        onPress={useToolbar().dismissCurrentSection}
      >
        <MaterialIcons
          style={styles.closeIcon}
          name="close"
          size={24 * useFontScale({ maximumScaleFactor: 1.5 })}
        />
      </TouchableOpacity>
    </View>
    {children}
  </View>
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold"
  },
  closeIcon: {
    opacity: 0.5
  },
  childContainer: {
    height: "100%"
  }
})
