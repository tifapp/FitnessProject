import { FormLabel } from "../formComponents/FormLabels"
import React from "react"
import { StyleSheet, Switch, View } from "react-native"
import { useEventFormField, useEventFormValue } from "./EventFormProvider"

/**
 * Advanced settings (hiding after start date, etc.) view for the event form.
 */
export const EventFormAdvancedSettings = () => {
  const [shouldHide, setShouldHide] = useEventFormField(
    "shouldHideAfterStartDate"
  )
  return (
    <View style={styles.hideSettingContainer}>
      <FormLabel
        style={styles.hideSettingTextContainer}
        headerText="Hide after start date"
        captionText="Disallow non-particpants from viewing the event on the map after it
          starts."
      />
      <Switch
        accessibilityRole="togglebutton"
        value={shouldHide}
        onValueChange={setShouldHide}
        thumbColor="white"
        trackColor={{ true: useEventFormValue("color") }}
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
  }
})
