import React from "react"
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import { SkeletonView } from "../common/Skeleton"
import { FontScaleFactors, useFontScale } from "../../lib/Fonts"
import { MaterialIcon, MaterialIconName } from "../common/Icons"

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
  <View style={[styles.container, style]}>
    {icon && <LabelIcon icon={icon} color={iconColor} />}
    <View>
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
    </View>
  </View>
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
  <View style={[styles.container, style]}>
    {icon && <LabelIcon icon={icon} color={iconColor} />}
    <View>
      <SkeletonView
        accessibilityLabel={headerAccessibilityLabel}
        style={{ ...styles.headerSkeleton, height: useSkeletonHeight() }}
      />
      <SkeletonView
        accessibilityLabel={captionAccessibilityLabel}
        style={{ ...styles.captionSkeleton, height: useSkeletonHeight() }}
      />
    </View>
  </View>
)

type LabelIconProps = {
  icon: MaterialIconName
  color: string
}

const LabelIcon = ({ icon, color }: LabelIconProps) => (
  <MaterialIcon
    name={icon}
    maximumFontScaleFactor={FontScaleFactors.xxxLarge}
    color={color}
    style={styles.icon}
  />
)

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
    marginRight: 8,
    opacity: 0.5
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16
  },
  captionText: {
    fontSize: 12,
    opacity: 0.5
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
