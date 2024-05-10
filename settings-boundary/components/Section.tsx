import { Subtitle } from "@components/Text"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { createContext, useContext } from "react"
import { ViewStyle, View, StyleProp, StyleSheet } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

export type SettingsSectionContextValues = {
  isDisabled: boolean
}

const SettingsSectionContext = createContext<SettingsSectionContextValues>({
  isDisabled: false
})

export const useCurrentSettingsSection = () => {
  return useContext(SettingsSectionContext)
}

export type SettingsSectionProps = {
  title?: string
  isDisabled?: boolean
  children: JSX.Element | JSX.Element[]
  style?: StyleProp<ViewStyle>
}

export const SettingsSectionView = ({
  title,
  isDisabled = false,
  children,
  style
}: SettingsSectionProps) => (
  <Animated.View
    entering={FadeIn}
    exiting={FadeOut}
    layout={TiFDefaultLayoutTransition}
  >
    <SettingsSectionContext.Provider value={{ isDisabled }}>
      <View style={style}>
        <View style={[styles.container, { opacity: isDisabled ? 0.5 : 1 }]}>
          {title && <Subtitle>{title}</Subtitle>}
          {children}
        </View>
      </View>
    </SettingsSectionContext.Provider>
  </Animated.View>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    rowGap: 16
  }
})
