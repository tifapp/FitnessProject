import { ChevronBackButton, StackNavigatorType } from "@components/Navigation"
import { Headline } from "@components/Text"
import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { delayData } from "@lib/DelayData"
import { EventMocks } from "@lib/events"
import { UserMocks } from "@lib/users/User"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import {
  ChangePasswordFormView,
  ChangePasswordResult,
  useChangePasswordForm
} from "@auth/ChangePassword"
import { ActivitiesStackParamList } from "@stacks/ActivitiesStack"
import { useAtomValue } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import React from "react"
import { View } from "react-native"
import EditProfileView from "../EditProfileScreen/EditProfileView"
import ProfileScreenView, { ProfileScreenViewProps } from "../ProfileView"
import { userAtom } from "../state"
import { EditProfileDismissButton } from "./EditProfileDismissButton"
import { HeaderLeftProfile, HeaderRightProfile } from "./ProfileHeaders"

export type ProfileScreensParamsList = {
  ChangePasswordScreen: undefined
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

export type ChangePasswordScreenProps = StackScreenProps<
  ProfileScreensParamsList,
  "ChangePasswordScreen"
>

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
      <ProfileStack.Screen
        name={"ChangePasswordScreen"}
        component={ChangePasswordScreen}
        options={{
          headerTitle: () => (
            <Headline style={{ color: AppStyles.darkColor }}>
              Change Password
            </Headline>
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

  return <ProfileScreenView user={user} events={events} />
}

const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps) => {
  const changePassword = useChangePasswordForm({
    changePassword: async () => await delayData<ChangePasswordResult>("valid"),
    onSuccess: () => navigation.goBack()
  })
  return <ChangePasswordFormView {...changePassword} />
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
  // update Atom
  useHydrateAtoms([[userAtom, user]])

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
