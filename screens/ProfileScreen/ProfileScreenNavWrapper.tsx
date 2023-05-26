import { useNavigation, useRoute } from "@react-navigation/native"
import { StackNavigationProp, createStackNavigator } from "@react-navigation/stack"
import { ActivitiesScreenNames, ActivitiesStackParamList, ProfileScreenRouteProps } from "@stacks/ActivitiesStack"
import ProfileScreen from "./ProfileScreen"
import { UserMocks } from "@lib/User";
import { ChevronBackButton } from "@components/Navigation";
import { TouchableIonicon } from "@components/common/Icons";
import MenuDropdown from "@components/eventCard/MenuDropdown";
import { StyleSheet, View } from "react-native";

const ProfileStack = createStackNavigator<ActivitiesStackParamList>();

export const ProfileScreenNavWrapper = () => {
  const user = UserMocks.Mia

  return (
    <ProfileStack.Navigator initialRouteName={ActivitiesScreenNames.PROFILE_SCREEN}>
      <ProfileStack.Screen name={ActivitiesScreenNames.PROFILE_SCREEN}
        options={({ navigation }: ProfileScreenRouteProps) => ({
          title: "",
          headerLeft: () => user.userStatus !== "current-user" && <ChevronBackButton />,
          headerRight: () => user.userStatus === "current-user" ? 
            <View style={{flexDirection: "row"}}>
              <TouchableIonicon icon={{ name: "create", style: styles.rightSpacing }}
                onPress={() => navigation.navigate(ActivitiesScreenNames.SETTINGS_SCREEN)}
              />
              <TouchableIonicon icon={{ name: "settings", style: styles.rightSpacing }}
                onPress={() => navigation.navigate(ActivitiesScreenNames.SETTINGS_SCREEN)}
              />

            </View>
            : <MenuDropdown isEventHost={false} style={styles.rightSpacing}/>,
          headerStyle: {height: 50}
        })}>
          {() => <ProfileScreen user={UserMocks.Mia}/>}
      </ProfileStack.Screen>
    </ProfileStack.Navigator>
  );
}

const styles = StyleSheet.create({
  rightSpacing: {
    paddingRight: 18
  }
})