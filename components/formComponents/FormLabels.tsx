import React, { ReactNode } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import { SkeletonView } from "../common/Skeleton"
import { FontScaleFactors, useFontScale } from "../../lib/FontScale"
import { MaterialIconName } from "../../lib/MaterialIcon"

export type FormLabelProps = {
  icon?: MaterialIconName
  iconColor?: string
  headerText: string
  textColor?: string
  captionText?: string
  style?: StyleProp<ViewStyle>
}

/**
 * A useful helper component for giving settings rows context.
 */
export const FormLabel = ({
  icon,
  iconColor = "black",
  headerText,
  captionText,
  textColor = "black",
  style
}: FormLabelProps) => (
  <FormLabelContainer icon={icon} iconColor={iconColor} style={style}>
    <Text
      maxFontSizeMultiplier={FontScaleFactors.accessibility2}
      style={{ ...styles.headerText, color: textColor }}
    >
      {headerText}
    </Text>
    {captionText && (
      <Text
        maxFontSizeMultiplier={FontScaleFactors.accessibility2}
        style={{ ...styles.captionText, color: textColor }}
      >
        {captionText}
      </Text>
    )}
  </FormLabelContainer>
)

export type SkeletonFormLabelProps = {
  icon?: MaterialIconName
  iconColor?: string
  headerAccessibilityLabel?: string
  captionAccessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

/**
 * A form label useful as a placeholder for loading content.
 */
export const SkeletonFormLabel = ({
  icon,
  iconColor = "black",
  headerAccessibilityLabel,
  captionAccessibilityLabel,
  style
}: SkeletonFormLabelProps) => (
  <FormLabelContainer icon={icon} iconColor={iconColor} style={style}>
    <SkeletonView
      accessibilityLabel={headerAccessibilityLabel}
      style={{ ...styles.headerSkeleton, height: useSkeletonHeight() }}
    />
    <SkeletonView
      accessibilityLabel={captionAccessibilityLabel}
      style={{ ...styles.captionSkeleton, height: useSkeletonHeight() }}
    />
  </FormLabelContainer>
)

type FormLabelContainerProps = {
  icon?: MaterialIconName
  iconColor?: string
  style?: StyleProp<ViewStyle>
  children: ReactNode
}

const FormLabelContainer = ({
  icon,
  iconColor,
  style,
  children
}: FormLabelContainerProps) => {
  const labelFontScale = useLabelFontScale()
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <MaterialIcons
          name={icon}
          size={24 * labelFontScale}
          color={iconColor}
          style={styles.icon}
        />
      )}
      <View>{children}</View>
    </View>
  )
}

const useLabelFontScale = () => {
  return useFontScale({
    maximumScaleFactor: FontScaleFactors.xxxLarge
  })
}

const useSkeletonHeight = () => {
  return 16 * useLabelFontScale()
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  icon: {
    marginRight: 8
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16
  },
  captionText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4
  },
  headerSkeleton: {
    width: 128,
    height: 16
  },
  captionSkeleton: {
    width: 256,
    height: 12,
    marginTop: 4
  }
})
