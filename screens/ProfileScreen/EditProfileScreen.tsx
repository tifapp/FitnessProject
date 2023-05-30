import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from "react-native"
import { View } from "react-native"
import { ProfileScreenProps } from "./ProfileScreen"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { BodyText, Headline } from "@components/Text"
import { ContentText } from "@components/ContentText"
import TextInputWithIcon from "@screens/ProfileScreen/TextInputWithIcon"
import { SetStateAction, useState } from "react"
import ContentTextInput from "./ContentTextInput"
import BottomTabButton from "@components/bottomTabComponents/BottomTabButton"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

type InputTypes = "display" | "bio" | "handle"

const EditProfileScreen = ({user}: ProfileScreenProps) => {
  const [displayName, setDisplayName] = useState(user.username)
  const [handle, setHandle] = useState(user.handle)
  const [bio, setBio] = useState(user.biography)
  const [hasChanged, setHasChanged] = useState(false)

  const onChangeText = (text: string, input: InputTypes) => {
    switch (input) {
      case "display":
        setDisplayName(text)
        if (text === user.username && bio === user.biography && handle === user.handle) {
          setHasChanged(false)
        } else {
          setHasChanged(true)
        }
        break

      case "bio":
        setBio(text)
        if (displayName === user.username && text === user.biography && handle === user.handle) {
          setHasChanged(false)
        } else {
          setHasChanged(true)
        }
        break

      case "handle":
        setHandle(text)
        if (displayName === user.username && bio === user.biography && text === user.handle) {
          setHasChanged(false)
        } else {
          setHasChanged(true)
        }
    }

  }

  return (
    <View style={styles.container}>  
      <KeyboardAwareScrollView>
        <View style={styles.spacing}>
          <View style={[styles.spacing, styles.imageSection]}>
            <TouchableOpacity>
              <Ionicon name="create" color="white" size={16} style={styles.badge}/>     
              <ProfileImage
                style={styles.profileImage}
                imageURL={user.profileImageURL}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputSpacing}>
            <BodyText style={styles.textInput}>Display Name</BodyText>
            <TextInputWithIcon
              iconName={"pencil-sharp"}
              text={displayName}
              onChangeText={(text) => onChangeText(text, "display")}
            />
          </View>

          <View style={styles.inputSpacing}>
            <BodyText style={styles.textInput}>Handle</BodyText>
            <TextInputWithIcon
              iconName={"at"}
              text={handle}
              onChangeText={(text) => onChangeText(text, "handle")}
            />
          </View>

          <View style={styles.inputSpacing}>
            <BodyText style={styles.textInput}>Bio</BodyText>
            <ContentTextInput
              text={bio}
              onChangeText={(text) => onChangeText(text, "bio")}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <BottomTabButton
        title="Save Changes"
        onPress={() => console.log("s")}
        disabled={!hasChanged}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  spacing: {
    paddingHorizontal: 16
  },
  imageSection: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32
  },
  profileImage: {
    width: 80,
    height: 80,
    marginBottom: 4,
    marginRight: 4
  },
  badge:{
    position:'absolute',
    zIndex:1,
    textAlign: "center",
    textAlignVertical: "center",
    bottom: 0,
    right: 0,
    paddingLeft: 7,
    paddingVertical: 6,
    paddingRight: 6,
    backgroundColor: AppStyles.darkColor,
    borderRadius:16,
    borderWidth: 2,
    borderColor: "white",
  },
  textInput: {
    color: AppStyles.colorOpacity50,
    marginBottom: 8
  },
  inputSpacing: {
    marginBottom: 32
  }
})
export default EditProfileScreen