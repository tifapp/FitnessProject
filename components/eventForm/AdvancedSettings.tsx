import React from "react"
import { StyleSheet, Switch, Text, View } from "react-native"
import { useEventFormContext, useEventFormField } from "."

/**
 * Advanced settings (hiding after start date, etc.) view for the event form.
 */
export const EventFormAdvancedSettings = () => (
  <View>
    <HideSettingSwitch />
  </View>
)

const HideSettingSwitch = () => {
  const [shouldHide, setShouldHide] = useEventFormField(
    "shouldHideAfterStartDate"
  )
  return (
    <View style={styles.hideSettingContainer}>
      <View style={styles.hideSettingTextContainer}>
        <Text maxFontSizeMultiplier={2.2} style={styles.hideSettingTitle}>
          Hide after start date
        </Text>
        <Text maxFontSizeMultiplier={2.2} style={styles.hideSettingDescription}>
          Disallow non-particpants from viewing the event on the map after it
          starts.
        </Text>
      </View>
      <Switch
        accessibilityRole="togglebutton"
        value={shouldHide}
        onValueChange={setShouldHide}
        thumbColor="white"
        trackColor={{ true: useEventFormContext().watch("color") }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  hideSettingContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  hideSettingTextContainer: {
    maxWidth: "70%"
  },
  hideSettingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8
  },
  hideSettingDescription: {
    opacity: 0.5,
    fontSize: 12
  }
})
