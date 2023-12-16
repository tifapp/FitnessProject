import React, { ReactNode } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { FontScaleFactors } from "../../lib/Fonts"
import { useEventFormContext } from "./EventForm"
import { MaterialIcon } from "@components/common/Icons"

export type EventFormSectionHeaderProps = {
  title: string
  children: ReactNode
}

/**
 * A header which displays a dismissable section of the event form.
 */
export const EventFormSectionHeader = ({
  title,
  children
}: EventFormSectionHeaderProps) => (
  <View style={styles.container}>
    <View style={styles.headerContainer}>
      <Text
        maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
        style={styles.headerText}
      >
        {title}
      </Text>
      <TouchableOpacity
        accessibilityLabel="Close Section"
        onPress={useEventFormContext().dismissCurrentSection}
      >
        <MaterialIcon
          style={styles.closeIcon}
          name="close"
          maximumFontScaleFactor={FontScaleFactors.xxxLarge}
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
