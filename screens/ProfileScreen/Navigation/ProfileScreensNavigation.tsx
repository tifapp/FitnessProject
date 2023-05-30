import { StackScreenProps } from "@react-navigation/stack"
import { ProfileScreenProps } from "../ProfileScreen"
import { StackNavigatorType } from "@components/Navigation";
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen";
import { ProfileScreenNavWrapper } from "./ProfileScreenNavWrapper";
import { EditProfileScreenNavWrapper } from "./EditProfileScreenNavWrapper";


export type ProfileScreensParamsList = {
  "Profile Screen": ProfileScreenProps
  "Edit Profile Screen": ProfileScreenProps
  "Settings Screen": undefined
}

export type ProfileScreenRouteProps = StackScreenProps<
  ProfileScreensParamsList,
  "Profile Screen"
>["route"]


export const createProfileStackScreens = <
  T extends ProfileScreensParamsList
>(
    ProfileStack: StackNavigatorType<T>
  ) => {
  return (
    <>
      <ProfileStack.Screen
        name={"Profile Screen"}
        component={ProfileScreenNavWrapper}
      />
      <ProfileStack.Screen
        name={"Edit Profile Screen"}
        component={EditProfileScreenNavWrapper}
      />
      <ProfileStack.Screen
        name={"Settings Screen"}
        component={SettingsScreen}
      />
    </>
  )
}
