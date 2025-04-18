import { CircularIoniconProps } from "@components/common/Icons"
import { BodyText, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { ReactNode, createContext, useContext } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { TiFFormCardView } from "./Card"

export type TiFFormSectionContextValues = {
  isDisabled: boolean
}

const TiFFormSectionContext = createContext<TiFFormSectionContextValues>({
  isDisabled: false
})

export const useTiFFormSectionContext = () => {
  return useContext(TiFFormSectionContext)
}

export type TiFFormSectionProps = {
  title?: string
  subtitle?: ReactNode
  rightAddon?: JSX.Element
  isDisabled?: boolean
  children?: ReactNode
  color?: string
  iconName?: CircularIoniconProps["name"]
  style?: StyleProp<ViewStyle>
}

export const TiFFormSectionView = ({
  title,
  subtitle,
  rightAddon,
  isDisabled = false,
  children,
  style,
  color,
  iconName
}: TiFFormSectionProps) => (
  <Animated.View
    entering={FadeIn}
    exiting={FadeOut}
    layout={TiFDefaultLayoutTransition}
  >
    <TiFFormSectionContext.Provider value={{ isDisabled }}>
      <View style={style}>
        <View style={[styles.container, { opacity: isDisabled ? 0.5 : 1 }]}>
          <View style={styles.textContainer}>
            {title && (
              <View style={[styles.titleRow]}>
                <View>
                  <Headline
                    style={{ color: color ?? AppStyles.primaryBlue.toString() }}
                  >
                    {title}
                  </Headline>
                </View>
                {rightAddon}
                {/* {
                  iconName &&
                  <CircularIonicon
                    size={24}
                    name={iconName}
                    color={AppStyles.primaryBlue.toString()}
                    backgroundColor="white"
                  />
                } */}
              </View>
            )}
            {subtitle && typeof subtitle === "string" && (
              <BodyText style={styles.subtitle}>{subtitle}</BodyText>
            )}
            {subtitle && typeof subtitle !== "string" && subtitle}
          </View>
          {children}
        </View>
      </View>
    </TiFFormSectionContext.Provider>
  </Animated.View>
)

export const TiFFormCardSectionView = ({
  children,
  ...props
}: TiFFormSectionProps) => (
  <TiFFormSectionView {...props}>
    <TiFFormCardView>{children}</TiFFormCardView>
  </TiFFormSectionView>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    rowGap: 16,
    marginBottom: 32
  },
  textContainer: {
    rowGap: 4
  },
  titleRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  subtitle: {
    opacity: 0.5
  }
})
