import {
  NavigationProp,
  ParamListBase,
  useNavigation
} from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { TouchableIonicon } from "./common/Icons"
import { EventID } from "TiFShared/domain-models/Event"
import { UserHandle, UserID } from "TiFShared/domain-models/User"
import { EditEventFormValues } from "@event/EditFormValues"

/**
 * A helper type that's useful for making reusable navigation flows.
 */
export type StackNavigatorType<
  ParamsList extends Record<string, object | undefined>
> = ReturnType<typeof createStackNavigator<ParamsList>>

/**
 * Returns an object of functions to navigate to essential app screens.
 */
export const useCoreNavigation = () => {
  // TODO: - Actually Navigate
  const navigation = useNavigation()
  return {
    presentEditEvent: (edit: EditEventFormValues, id?: EventID) => {
      console.log("Edit", edit, id)
    },
    presentProfile: (id: UserID | UserHandle) => {
      console.log("Profile", id)
    },
    pushEventDetails: (id: EventID) => {
      console.log("Details", id)
    },
    pushAttendeesList: (id: EventID) => {
      console.log("Attendees List", id)
    }
  }
}

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
      accessibilityLabel="Go Back"
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
      accessibilityLabel="Go Back"
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
