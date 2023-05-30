import { useNavigation, useRoute } from "@react-navigation/native"
import { StackNavigationProp, createStackNavigator } from "@react-navigation/stack"
import { ActivitiesScreenNames, ActivitiesStackParamList, ProfileScreenRouteProps } from "@stacks/ActivitiesStack"
import ProfileScreen from "./ProfileScreen"
import { UserMocks } from "@lib/users/User";
import { ChevronBackButton } from "@components/Navigation";
import { TouchableIonicon } from "@components/common/Icons";
import MenuDropdown from "@components/eventCard/MenuDropdown";
import { StyleSheet, View } from "react-native";
import EditProfileScreen from "./EditProfileScreen";
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen";

const ProfileStack = createStackNavigator<ActivitiesStackParamList>();

export const ProfileScreenNavWrapper = () => {
  const user = UserMocks.Mia

  const renderHeaderRight =
  (navigation: StackNavigationProp<ActivitiesStackParamList,
    ActivitiesScreenNames.PROFILE_SCREEN>
  ) => {
    if (user.userStatus === "current-user") {
      return (
        <View style={{flexDirection: "row"}}>
          <TouchableIonicon icon={{ name: "create", style: styles.rightSpacing }}
            onPress={() => navigation.navigate(ActivitiesScreenNames.EDIT_PROFILE)}
          />
          <TouchableIonicon icon={{ name: "settings", style: styles.rightSpacing }}
            onPress={() => navigation.navigate(ActivitiesScreenNames.SETTINGS_SCREEN)}
          />
        </View>
      )
    }

    return (
      <MenuDropdown isEventHost={false} style={styles.rightSpacing}/>
    )
  }

  return (
    <ProfileStack.Navigator initialRouteName={ActivitiesScreenNames.PROFILE_SCREEN}>
      <ProfileStack.Screen name={ActivitiesScreenNames.PROFILE_SCREEN}
        options={({ navigation }: ProfileScreenRouteProps) => ({
          title: "",
          headerStyle: {height: 50},
          headerLeft: () => user.userStatus !== "current-user" && <ChevronBackButton />,
          headerRight:() => renderHeaderRight(navigation)
        })}>
          {() => <ProfileScreen user={user}/>}
      </ProfileStack.Screen>
      <ProfileStack.Screen name={ActivitiesScreenNames.EDIT_PROFILE}>
        {() => <EditProfileScreen user={user}/>}
      </ProfileStack.Screen>
      <ProfileStack.Screen
        name={ActivitiesScreenNames.SETTINGS_SCREEN}
        component={SettingsScreen}
      />
    </ProfileStack.Navigator>
  );
}

const styles = StyleSheet.create({
  rightSpacing: {
    paddingRight: 18
  }
})