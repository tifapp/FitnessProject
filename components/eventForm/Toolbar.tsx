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
import { EventFormToolbarSection, useEventFormContext } from "./EventForm"
import { MaterialIcons } from "@expo/vector-icons"
import { useFontScale } from "@lib/FontScale"

export type EventFormToolbarProps = {
  scrollStyle?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
}

/**
 * A horizontally scrolling toolbar for an event form.
 *
 * Each tab on the toolbar opens a bottom sheet screen
 * where its respective form values can be edited.
 */
export const EventFormToolbar = ({
  scrollStyle,
  containerStyle
}: EventFormToolbarProps) => (
  <ScrollView
    horizontal
    keyboardShouldPersistTaps="always"
    style={scrollStyle}
    contentContainerStyle={containerStyle}
  >
    <DateTab />
    <ColorTab />
    <AdvancedSettingsTab />
  </ScrollView>
)

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
  section: EventFormToolbarSection
  accessibilityLabel: string
}

const SectionTab = ({
  children,
  section,
  accessibilityLabel
}: SectionTabProps) => {
  const { openSection } = useEventFormContext()
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
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  outlined: {
    borderWidth: 1,
    borderRadius: 12,
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
