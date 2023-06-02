import React from "react"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import ProfileScreenView, { ProfileScreenViewProps } from "../ProfileView"
import { ChevronBackButton, StackNavigatorType } from "@components/Navigation"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ActivitiesStackParamList } from "@stacks/ActivitiesStack"
import { useAtomValue } from "jotai"
import { userAtom } from "../state"
import { UserMocks } from "@lib/users/User"
import { HeaderLeftProfile, HeaderRightProfile } from "./ProfileHeaders"
import { Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { EditProfileDismissButton } from "./EditProfileDismissButton"
import EditProfileView from "../EditProfileScreen/EditProfileView"
import { EventMocks } from "@lib/events"
import { useHydrateAtoms } from "jotai/utils"
import { View } from "react-native"
import { TouchableIonicon } from "@components/common/Icons"

export type ProfileScreensParamsList = {
  ProfileScreen: ProfileScreenViewProps
  EditProfileScreen: undefined
  SettingsScreen: undefined
  CurrentUserProfileScreen: undefined
}

export type ProfileScreenRouteProps = StackScreenProps<
  ProfileScreensParamsList,
  "ProfileScreen"
>["route"]

export type ProfileScreenProps = {
  userID: string
} & StackScreenProps<ProfileScreensParamsList, "ProfileScreen">

export const createProfileStackScreens = <T extends ProfileScreensParamsList>(
  ProfileStack: StackNavigatorType<T>
) => {
  return (
    <>
      <ProfileStack.Screen
        name={"ProfileScreen"}
        options={({ navigation }) => ({
          title: "",
          headerLeft: () => <HeaderLeftProfile />,
          headerRight: () => (
            <HeaderRightProfile
              onPressEditProfile={() =>
                navigation.navigate("EditProfileScreen")
              }
              onPressSettings={() => navigation.navigate("SettingsScreen")}
            />
          )
        })}
        component={ProfileScreen}
      />
      <ProfileStack.Screen
        name={"CurrentUserProfileScreen"}
        options={({ navigation }) => ({
          title: "",
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              <TouchableIonicon
                icon={{ name: "create", style: { paddingRight: 18 } }}
                onPress={() => navigation.navigate("EditProfileScreen")}
              />
              <TouchableIonicon
                icon={{ name: "settings", style: { paddingRight: 18 } }}
                onPress={() => navigation.navigate("SettingsScreen")}
              />
            </View>
          )
        })}
        component={CurrentUserProfileScreen}
      />
      <ProfileStack.Screen
        name={"EditProfileScreen"}
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
        name={"SettingsScreen"}
        component={SettingsScreen}
        options={{
          headerTitle: () => (
            <Headline style={{ color: AppStyles.darkColor }}>Settings</Headline>
          ),
          headerTitleAlign: "center",
          headerLeft: () => <ChevronBackButton />
        }}
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
  // get user
  const user = UserMocks.Mia
  // user.relationStatus = "current-user"
  // get user's events
  const events = [
    EventMocks.Multiday,
    EventMocks.NoPlacemarkInfo,
    EventMocks.PickupBasketball
  ]
  // update Atom
  useHydrateAtoms([[userAtom, user]])

  return <ProfileScreenView user={user} events={events} />
}

const CurrentUserProfileScreen = () => {
  // get current user
  const user = UserMocks.Mia
  user.relationStatus = "current-user"

  // get user's events
  const events = [
    EventMocks.Multiday,
    EventMocks.NoPlacemarkInfo,
    EventMocks.PickupBasketball
  ]

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
    <ProfileStack.Navigator initialRouteName={"CurrentUserProfileScreen"}>
      {profileScreens}
    </ProfileStack.Navigator>
  )
}
