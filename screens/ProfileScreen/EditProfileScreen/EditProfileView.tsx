import ProfileImage from "@components/profileImageComponents/ProfileImage"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { BodyText } from "@components/Text"
import BottomTabButton from "@components/bottomTabComponents/BottomTabButton"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { User } from "@lib/users/User"
import { useAtom } from "jotai"
import { hasEditedProfileAtom } from "../state"
import React, { useState } from "react"
import CustomizableTextInput from "@components/common/CustomizableTextInput.tsx"
import { ContentText } from "@content-parsing"

type InputTypes = "display" | "bio" | "handle"

type EditProfileViewProps = {
  user: User
}

const EditProfileView = ({ user }: EditProfileViewProps) => {
  const [displayName, setDisplayName] = useState(user.name)
  const [handle, setHandle] = useState(user.handle.substring(1))
  const [bio, setBio] = useState(user.bio)
  const [handleErrorMessage, setHandleErrorMessage] = useState<
    string | undefined
  >(undefined)
  const [hasEdited, setHasEdited] = useAtom(hasEditedProfileAtom)

  const onChangeText = (text: string, input: InputTypes) => {
    switch (input) {
    case "display":
      setDisplayName(text)
      if (text === user.name && bio === user.bio && handle === user.handle) {
        setHasEdited(false)
      } else {
        setHasEdited(true)
      }
      break

    case "bio":
      setBio(text)
      if (
        displayName === user.name &&
          text === user.bio &&
          handle === user.handle
      ) {
        setHasEdited(false)
      } else {
        setHasEdited(true)
      }
      break

    case "handle":
      setHandle(text)
      if (handleErrorMessage) {
        setHandleErrorMessage(undefined)
      }
      if (
        displayName === user.name &&
          bio === user.bio &&
          text === user.handle
      ) {
        setHasEdited(false)
      } else {
        setHasEdited(true)
      }
      break
    }
  }

  const onSaveChanges = () => {
    // Check if handle is already taken/save to backend
    setHandleErrorMessage("That handle is already taken.")
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
            <CustomizableTextInput
              iconName={"pencil-sharp"}
              onChangeText={(text) => onChangeText(text, "display")}
            >
              <BodyText>{displayName}</BodyText>
            </CustomizableTextInput>
          </View>

          <View style={styles.inputSpacing}>
            <BodyText style={styles.textInput}>Handle</BodyText>
            <CustomizableTextInput
              iconName={"at"}
              onChangeText={(text) => onChangeText(text, "handle")}
              errorMessage={handleErrorMessage}
            >
              <BodyText>{handle}</BodyText>
            </CustomizableTextInput>
          </View>

          <View style={styles.inputSpacing}>
            <BodyText style={styles.textInput}>Bio</BodyText>
            <CustomizableTextInput
              onChangeText={(text) => onChangeText(text, "bio")}
              multiline
            >
              <ContentText
                text={bio}
                onUserHandleTapped={() => console.log(handle)}
                onEventHandleTapped={() => console.log(handle)}
              />
            </CustomizableTextInput>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <BottomTabButton
        title="Save Changes"
        onPress={onSaveChanges}
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
