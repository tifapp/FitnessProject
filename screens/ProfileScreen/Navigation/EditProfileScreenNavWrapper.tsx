import { UserMocks } from "@lib/users/User"
import EditProfileScreen from "../EditProfileScreen/EditProfileScreen"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Alert, StyleSheet } from "react-native"
import { Headline } from "@components/Text"
import {TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"

export const EditProfileScreenNavWrapper = () => {
  const navigation = useNavigation<StackNavigationProp<any>>()
  const [hasEdited, setHasEdited] = useState(false)
  const user = UserMocks.Mia

  let dismiss: () => void

  const warnUser = useCallback(() => {
    if (hasEdited) {
      Alert.alert("Discard Edits?", "Changes you have made will not be saved.",[
        { text: "Discard", style: "destructive", onPress: navigation.goBack},
        { text: "Keep Editing", onPress: dismiss}
      ])
    } else {
      navigation.goBack()
    }
  }, [hasEdited])

  useEffect (() => {
    navigation.setOptions({
      headerTitle: () => <Headline style={styles.headerColor}>Edit Profile</Headline>,
      headerTitleAlign: "center",
      headerLeft: () =>
        <TouchableIonicon
          icon={{name: "close", color: AppStyles.darkColor}}
          style={styles.leftSpacing}
          onPress={warnUser}
        />
    })
  }, [navigation, hasEdited])

  return (
    <EditProfileContext.Provider value={{hasEdited, setHasEdited}}>
      <EditProfileScreen user={user} />
    </EditProfileContext.Provider>
  )
}

type EditProfileContextValues = {
  /**
   * True if the profile has been edited.
   */
  hasEdited: boolean

  /**
   * Set if the profile has been edited.
   */
  setHasEdited: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Returns the current values from a parent `EditProfile` component.
 */
export const useEditProfileContext = () => {
  const context = useContext(EditProfileContext)
  return { ...context!}
}

const EditProfileContext =
  createContext<EditProfileContextValues | undefined>(undefined)

const styles = StyleSheet.create({
  leftSpacing: {
    paddingLeft: 16
  },
  headerColor: {
    color: AppStyles.darkColor
  }
})