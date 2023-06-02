import React from "react"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import ProfileScreenView, { ProfileScreenViewProps } from "../ProfileView"
import { StackNavigatorType } from "@components/Navigation"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import {
  ActivitiesScreenNames,
  ActivitiesStackParamList
} from "@stacks/ActivitiesStack"
import { useAtomValue, useSetAtom } from "jotai"
import { userAtom } from "../state"
import { UserMocks } from "@lib/users/User"
import { HeaderLeftProfile, HeaderRightProfile } from "./ProfileHeaders"
import { Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { EditProfileDismissButton } from "./EditProfileDismissButton"
import EditProfileView from "../EditProfileScreen/EditProfileView"
import { EventMocks } from "@lib/events"

export type ProfileScreensParamsList = {
  "Profile Screen": ProfileScreenViewProps
  "Edit Profile Screen": undefined
  "Settings Screen": undefined
}

export type ProfileScreenRouteProps = StackScreenProps<
  ProfileScreensParamsList,
  "Profile Screen"
>["route"]

export type ProfileScreenProps = {
  userID: string
} & StackScreenProps<ProfileScreensParamsList, "Profile Screen">

export const createProfileStackScreens = <T extends ProfileScreensParamsList>(
  ProfileStack: StackNavigatorType<T>
) => {
  return (
    <>
      <ProfileStack.Screen
        name={ActivitiesScreenNames.PROFILE_SCREEN}
        options={({ navigation }) => ({
          title: "",
          headerLeft: () => <HeaderLeftProfile />,
          headerRight: () => (
            <HeaderRightProfile
              onPressEditProfile={() =>
                navigation.navigate(ActivitiesScreenNames.EDIT_PROFILE)
              }
              onPressSettings={() =>
                navigation.navigate(ActivitiesScreenNames.SETTINGS_SCREEN)
              }
            />
          )
        })}
        component={ProfileScreen}
      />
      <ProfileStack.Screen
        name={ActivitiesScreenNames.EDIT_PROFILE}
        component={EditProfileScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <Headline style={{ color: AppStyles.darkColor }}>
              Edit Profile
            </Headline>
          ),
          headerTitleAlign: "center",
          headerLeft: () => (
            <EditProfileDismissButton onDismiss={() => navigation.goBack()} />
          )
        })}
      />
      <ProfileStack.Screen
        name={ActivitiesScreenNames.SETTINGS_SCREEN}
        component={SettingsScreen}
      />
    </>
  )
}

/**
 *
 * @param route Route of component to get userId param
 * @returns Profile Screen Component
 */
const ProfileScreen = ({ route }: ProfileScreenProps) => {
  console.log(route)
  const setUser = useSetAtom(userAtom)
  // get user
  const user = UserMocks.Mia
  user.relationStatus = "current-user"
  // get user's events
  const events = [
    EventMocks.Multiday,
    EventMocks.NoPlacemarkInfo,
    EventMocks.PickupBasketball
  ]
  // update Atom
  setUser(user)

  return <ProfileScreenView user={user} events={events} />
}

const EditProfileScreen = () => {
  const user = useAtomValue(userAtom)

  return user ? <EditProfileView user={user} /> : null
}

/**
 * Navigation Stack for Profile Screens for use in the Tab Navigator (so headers render)
 */
export const ProfileStack = () => {
  const ProfileStack = createStackNavigator<ActivitiesStackParamList>()
  const profileScreens =
    createProfileStackScreens<ActivitiesStackParamList>(ProfileStack)

  return (
    <ProfileStack.Navigator
      initialRouteName={ActivitiesScreenNames.PROFILE_SCREEN}
    >
      {profileScreens}
    </ProfileStack.Navigator>
  )
}
