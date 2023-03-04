import React, { ComponentProps, ReactNode } from "react"
import {
  ScrollView,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  StyleSheet
} from "react-native"
import { useEventFormContext } from "../EventForm"
import { ToolbarProvider, ToolbarSection, useToolbar } from "./ToolbarProvider"
import { MaterialIcons } from "@expo/vector-icons"
import { useFontScale } from "@hooks/useFontScale"

/**
 * A horizontally scrolling toolbar for an event form.
 *
 * Each tab on the toolbar opens a bottom sheet screen
 * where its respective form values can be edited.
 */
export const EventFormToolbar = () => {
  return (
    <ToolbarProvider>
      <ScrollView horizontal contentContainerStyle={styles.scrollView}>
        <DateTab />
        <ColorTab />
        <AdvancedSettingsTab />
      </ScrollView>
    </ToolbarProvider>
  )
}

const DateTab = () => (
  <SectionTab section="date" accessibilityLabel="Update Dates">
    <SectionTabIcon name="date-range" style={styles.tabSpacer} />
    <Text style={styles.tabText}>
      {useEventFormContext().watch("dateRange").formatted()}
    </Text>
  </SectionTab>
)

const ColorTab = () => (
  <SectionTab section="color" accessibilityLabel="Color">
    <SectionTabIcon name="palette" style={styles.tabSpacer} />
    <Text style={[styles.tabText, styles.tabSpacer]}>Color</Text>
    <ColorCicle />
  </SectionTab>
)

const ColorCicle = () => (
  <View
    style={{
      backgroundColor: useEventFormContext().watch("color"),
      width: 16 * useFontScale(),
      height: 16 * useFontScale(),
      ...styles.colorCircle
    }}
  />
)

const AdvancedSettingsTab = () => (
  <SectionTab section="advanced" accessibilityLabel="Advanced Settings">
    <SectionTabIcon name="keyboard-control" />
  </SectionTab>
)

type SectionTabIconProps = {
  name: ComponentProps<typeof MaterialIcons>["name"]
  style?: StyleProp<ViewStyle>
}

const SectionTabIcon = ({ name, style = {} }: SectionTabIconProps) => (
  <MaterialIcons
    name={name}
    size={16 * useFontScale()}
    color="black"
    style={[styles.tabIcon, style]}
  />
)

type SectionTabProps = {
  children: ReactNode
  section: ToolbarSection
  accessibilityLabel: string
}

const SectionTab = ({
  children,
  section,
  accessibilityLabel
}: SectionTabProps) => {
  const { openSection } = useToolbar()
  return (
    <TouchableOpacity
      onPress={() => openSection(section)}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.outlined}>
        <View style={styles.tabChild}>
          <View style={styles.tabContentContainer}>{children}</View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 16,
    height: 64
  },
  outlined: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#dedede",
    outlineColor: "black",
    outlineStyle: "solid",
    outlineWidth: 1,
    marginRight: 8
  },
  tabChild: {
    padding: 8
  },
  tabContentContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  tabText: {
    fontWeight: "600",
    opacity: 0.5
  },
  tabIcon: {
    opacity: 0.5
  },
  tabSpacer: {
    marginRight: 8
  },
  colorCircle: {
    borderRadius: 32
  }
})
