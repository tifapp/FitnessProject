import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { BodyText } from "@components/Text"
import TextInputWithIcon from "@screens/ProfileScreen/EditProfileScreen/TextInputWithIcon"
import ContentTextInput from "./ContentTextInput"
import BottomTabButton from "@components/bottomTabComponents/BottomTabButton"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { User } from "@lib/users/User"
import { useAtom } from "jotai"
import { hasEditedProfileAtom } from "../state"
import React, { useState } from "react"

type InputTypes = "display" | "bio" | "handle"

type EditProfileViewProps = {
  user: User
}

const EditProfileView = ({ user }: EditProfileViewProps) => {
  const [displayName, setDisplayName] = useState(user.username)
  const [handle, setHandle] = useState(user.handle)
  const [bio, setBio] = useState(user.biography)
  const [hasError, setHasError] = useState(false)
  const [hasEdited, setHasEdited] = useAtom(hasEditedProfileAtom)

  const onChangeText = (text: string, input: InputTypes) => {
    switch (input) {
    case "display":
      setDisplayName(text)
      if (
        text === user.username &&
          bio === user.biography &&
          handle === user.handle
      ) {
        setHasEdited(false)
      } else {
        setHasEdited(true)
      }
      break

    case "bio":
      setBio(text)
      if (
        displayName === user.username &&
          text === user.biography &&
          handle === user.handle
      ) {
        setHasEdited(false)
      } else {
        setHasEdited(true)
      }
      break

    case "handle":
      setHandle(text)
      if (
        displayName === user.username &&
          bio === user.biography &&
          text === user.handle
      ) {
        setHasEdited(false)
      } else {
        setHasEdited(true)
      }
      break
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView>
        <View style={styles.spacing}>
          <View style={[styles.spacing, styles.imageSection]}>
            <TouchableOpacity>
              <Ionicon
                name="create"
                color="white"
                size={16}
                style={styles.badge}
              />
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
              hasError={hasError}
              errorMessage="That handle is already taken."
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
        onPress={() => console.log("saved")}
        disabled={!hasEdited}
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
  badge: {
    position: "absolute",
    zIndex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    bottom: 0,
    right: 0,
    paddingLeft: 7,
    paddingVertical: 6,
    paddingRight: 6,
    backgroundColor: AppStyles.darkColor,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white"
  },
  textInput: {
    color: AppStyles.colorOpacity50,
    marginBottom: 8
  },
  inputSpacing: {
    marginBottom: 32
  }
})
export default EditProfileView
