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
import {
  EditEventFormValues,
  toRouteableEditFormValues
} from "@event/EditFormValues"
import { NativeStackHeaderLeftProps } from "@react-navigation/native-stack"

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
      const formValues = toRouteableEditFormValues(edit)
      if (id) {
        navigation.navigate("editEvent", {
          screen: "editEventForm",
          params: { ...formValues, id }
        })
      } else {
        navigation.navigate("editEvent", {
          screen: "createEventForm",
          params: formValues
        })
      }
    },
    presentProfile: (
      id: UserID | UserHandle,
      method: "navigate" | "replace" = "navigate"
    ) => {
      ;(navigation as any)[method]("editEvent", {
        screen: "userProfile",
        params: { id, method }
      })
    },
    pushEventDetails: (
      id: EventID,
      method: "navigate" | "replace" = "navigate"
    ) => {
      // NB: Typescript doesn't like the subscript for some reason, but navigation should always
      // have a navigate and replace method.
      ;(navigation as any)[method]("eventDetails", { id, method })
    },
    pushAttendeesList: (id: EventID) => {
      navigation.navigate("eventAttendeesList", { id })
    }
  }
}

/**
 * Base styles that all navigation headers should use.
 */
export const BASE_HEADER_SCREEN_OPTIONS = {
  cardStyle: {
    backgroundColor: "white"
  },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: "white" },
  headerTitleStyle: {
    fontSize: 16,
    fontFamily: "OpenSansBold"
  }
}

export type BackButtonProps = NativeStackHeaderLeftProps & {
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
    marginRight: 24
  }
})
