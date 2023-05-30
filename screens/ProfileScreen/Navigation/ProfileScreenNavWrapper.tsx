import { UserMocks } from "@lib/users/User"
import ProfileScreen from "../ProfileScreen"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useEffect } from "react"
import { View } from "react-native"
import { TouchableIonicon } from "@components/common/Icons"
import { ActivitiesScreenNames } from "@stacks/ActivitiesStack"
import { StyleSheet } from "react-native"
import ConfirmationDialogue from "@components/common/ConfirmationDialogue"
import { ChevronBackButton } from "@components/Navigation"

export const ProfileScreenNavWrapper = () => {
  const navigation = useNavigation<StackNavigationProp<any>>()
  const user = UserMocks.Mia

  const renderHeaderRight = (navigation: StackNavigationProp<any>) => {
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
      <ConfirmationDialogue style={styles.rightSpacing} />
    )
  }

  useEffect (() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => user.userStatus !== "current-user" && <ChevronBackButton />,
      headerRight: () => renderHeaderRight(navigation)
    })
  }, [navigation])

  return <ProfileScreen user={user}/>
}

const styles = StyleSheet.create({
  rightSpacing: {
    paddingRight: 18
  }
})