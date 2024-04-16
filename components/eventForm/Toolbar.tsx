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
import { EventFormSection, useEventFormContext } from "./EventForm"
import { MaterialIcons } from "@expo/vector-icons"
import { FontScaleFactors, useFontScale } from "../../lib/Fonts"

export type EventFormToolbarProps = {
  containerStyle?: StyleProp<ViewStyle>
}

/**
 * A horizontally scrolling toolbar for an event form.
 *
 * Each tab on the toolbar opens a bottom sheet screen
 * where its respective form values can be edited.
 */
export const EventFormToolbar = ({ containerStyle }: EventFormToolbarProps) => (
  <ScrollView
    horizontal
    keyboardShouldPersistTaps="always"
    showsHorizontalScrollIndicator={false}
    style={styles.scroll}
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
    <Text
      maxFontSizeMultiplier={FontScaleFactors.accessibility2}
      style={styles.tabText}
    >
      {useEventFormContext().watch("dateRange").ext.formatted()}
    </Text>
  </SectionTab>
)

const ColorTab = () => (
  <SectionTab section="color" accessibilityLabel="Color">
    <SectionTabIcon name="palette" style={styles.tabSpacer} />
    <Text
      maxFontSizeMultiplier={FontScaleFactors.accessibility2}
      style={[styles.tabText, styles.tabSpacer]}
    >
      Color
    </Text>
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
    size={18 * useToolbarFontScale()}
    color="black"
    style={[styles.tabIcon, style]}
  />
)

type SectionTabProps = {
  children: ReactNode
  section: EventFormSection
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
        <View
          style={{ ...styles.tabChild, height: 40 * useToolbarFontScale() }}
        >
          <View style={styles.tabContentContainer}>{children}</View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const useToolbarFontScale = () => {
  return useFontScale({ maximumScaleFactor: FontScaleFactors.accessibility2 })
}

const styles = StyleSheet.create({
  scroll: {
    minWidth: "100%"
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 8
  },
  tabContentContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  tabText: {
    fontWeight: "600",
    opacity: 0.5,
    fontSize: 16
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
