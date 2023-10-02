import {
  NavigationProp,
  ParamListBase,
  useNavigation
} from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { TouchableIonicon } from "./common/Icons"

/**
 * A helper type that's useful for making reusable navigation flows.
 */
export type StackNavigatorType<
  ParamsList extends Record<string, object | undefined>
> = ReturnType<typeof createStackNavigator<ParamsList>>

/**
 * Base styles that all navigation headers should use.
 */
export const BASE_HEADER_SCREEN_OPTIONS = {
  headerStyle: {
    shadowColor: "transparent",
    elevation: 0
  },
  cardStyle: {
    backgroundColor: "white"
  },
  headerTitleStyle: {
    fontSize: 16,
    fontFamily: "OpenSansBold"
  }
}

export type BackButtonProps = {
  style?: StyleProp<ViewStyle>
}

/**
 * A back button that is a simple chevron icon.
 */
export const ChevronBackButton = ({
  style = styles.backButtonPadding
}: BackButtonProps) => {
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  return (
    <TouchableIonicon
      icon={{ name: "chevron-back" }}
      onPress={() => navigation.goBack()}
      style={style}
    />
  )
}

export const XMarkBackButton = ({
  style = styles.backButtonPadding
}: BackButtonProps) => {
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  return (
    <TouchableIonicon
      icon={{ name: "close" }}
      onPress={() => navigation.goBack()}
      style={style}
    />
  )
}

const styles = StyleSheet.create({
  backButtonPadding: {
    paddingLeft: 16
  }
})
