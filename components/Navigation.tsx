import {
  EditEventFormValues,
  toRouteableEditFormValues
} from "@event/EditFormValues"
import { useNavigation } from "@react-navigation/native"
import { NativeStackHeaderLeftProps } from "@react-navigation/native-stack"
import { type NavigationState } from "@react-navigation/routers"
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack"
import React, { useEffect, useRef } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { EventID } from "TiFShared/domain-models/Event"
import { UserHandle, UserID } from "TiFShared/domain-models/User"
import { TouchableIonicon } from "./common/Icons"
import { useBottomSheetModal } from "@gorhom/bottom-sheet"

/**
 * A helper type that's useful for making reusable navigation flows.
 */
export type StackNavigatorType<
  ParamsList extends Record<string, object | undefined>
> = ReturnType<typeof createStackNavigator<ParamsList>>

// NB: ReturnType<typeof useNavigation> resolves to unknown, so we'll copy the type from react
// navigation instead.

export type UseNavigationReturn = Omit<
  StackNavigationProp<ReactNavigation.RootParamList>,
  "getState"
> & {
  getState(): NavigationState | undefined
}

/**
 * Returns the main navigator in the current navigation context in the app.
 *
 * Use this instead hook of `useNavigation`, as this hook will ensure to dismiss any bottom sheet
 * modals when navigating.
 */
export const useTiFNavigation = (): UseNavigationReturn => {
  const { dismissAll } = useBottomSheetModal()
  const navigation = useNavigation<UseNavigationReturn>()
  const navigate: UseNavigationReturn["navigate"] = (
    ...args: Parameters<UseNavigationReturn["navigate"]>
  ) => {
    dismissAll()
    navigation.navigate(...args)
  }
  const replace: UseNavigationReturn["replace"] = (
    ...args: Parameters<UseNavigationReturn["replace"]>
  ) => {
    dismissAll()
    navigation.navigate(...args)
  }
  return { ...navigation, navigate, replace }
}

/**
 * Returns an object of functions to navigate to essential app screens.
 */
export const useCoreNavigation = () => {
  const navigation = useTiFNavigation()
  return {
    presentEditEvent: (edit: EditEventFormValues, id?: EventID) => {
      const formValues = toRouteableEditFormValues(edit)
      if (id) {
        navigation.navigate("modal", {
          screen: "editEventForm",
          params: { ...formValues, id }
        })
      } else {
        navigation.navigate("modal", {
          screen: "createEventForm",
          params: formValues
        })
      }
    },
    presentProfile: (id: UserID | UserHandle) => {
      navigation.navigate("modal", { screen: "userProfile", params: { id } })
    },
    pushEventDetails: (
      id: EventID,
      method: "replace" | "navigate" = "navigate"
    ) => {
      if (method === "replace") {
        navigation.replace("eventDetails", { id })
      } else {
        navigation.navigate("eventDetails", { id })
      }
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
  navigation?: UseNavigationReturn
  style?: StyleProp<ViewStyle>
}

/**
 * Sets the back button for the current screen.
 *
 * Use this hook instead of setting the back button in the screen options because `useNavigation`
 * will return the parent navigator inside a nested navigator screen. This causes the `goBack`
 * method to dismiss the entire nested navigator instead of navigating to the previous screen
 * within the nested navigator.
 *
 * @param Button The button component to render. By default, the component is determined by the position of the screen on the stack.
 */
export const useBackButton = (
  Button?: (props: BackButtonProps) => JSX.Element
) => {
  const navigation = useTiFNavigation()
  const DefaultButton = useDefaultBackButtonView()
  const HeaderButton = Button ?? DefaultButton
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderButton navigation={navigation} />
    })
  }, [navigation, HeaderButton])
}

const useDefaultBackButtonView = () => {
  const indexRef = useRef(-1)
  const state = useTiFNavigation().getState()
  indexRef.current =
    indexRef.current === -1 && state?.index !== undefined
      ? state.index
      : indexRef.current
  const isFirstStackScreen = indexRef.current === 0
  return isFirstStackScreen ? XMarkBackButton : ChevronBackButton
}

/**
 * A back button that is a simple chevron icon.
 */
export const ChevronBackButton = ({
  navigation,
  style = styles.backButtonPadding
}: BackButtonProps) => {
  const currentNavigation = useTiFNavigation()
  return (
    <TouchableIonicon
      icon={{ name: "chevron-back" }}
      accessibilityLabel="Go Back"
      onPress={() => (navigation ?? currentNavigation).goBack()}
      style={style}
    />
  )
}

export const XMarkBackButton = ({
  navigation,
  style = styles.backButtonPadding
}: BackButtonProps) => {
  const currentNavigation = useTiFNavigation()
  return (
    <TouchableIonicon
      icon={{ name: "close" }}
      accessibilityLabel="Go Back"
      onPress={() => (navigation ?? currentNavigation).goBack()}
      style={style}
    />
  )
}

const styles = StyleSheet.create({
  backButtonPadding: {
    marginRight: 24
  }
})
