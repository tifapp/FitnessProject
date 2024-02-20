import React from "react"
import { Alert, Dimensions, Image, TouchableOpacity } from "react-native"
import usePhotos from "../hooks/usePhotos"

interface Props {
  imageURL: string
  setImageURL: React.Dispatch<React.SetStateAction<string>>
  setImageChanged: React.Dispatch<React.SetStateAction<boolean>>
}

const ProfilePic = ({ imageURL, setImageURL, setImageChanged }: Props) => {
  const [pickFromGallery, pickFromCamera] = usePhotos()

  const promptUser = () => {
    const title = "Select a profile pic!"
    const options = [
      {
        text: "Take a pic",
        onPress: () => pickFromCamera(setImageURL, setImageChanged)
      },
      {
        text: "Select a pic from photos",
        onPress: () => pickFromGallery(setImageURL, setImageChanged)
      },
      {
        text: "Remove pic",
        onPress: () => {
          if (imageURL !== "") setImageChanged(true)
          setImageURL("")
        }
      },
      { text: "Cancel", type: "cancel" }
    ]
    Alert.alert(title, "", options, { cancelable: true })
  }

  return (
    <TouchableOpacity onPress={() => promptUser()}>
      <Image
        style={{
          alignSelf: "flex-start",
          width: Dimensions.get("window").width / 2 - 30,
          height: Dimensions.get("window").width / 2 - 30
        }}
        source={
          imageURL === "" ? require("../assets/icon.png") : { uri: imageURL }
        }
      />
    </TouchableOpacity>
  )
}

export default ProfilePic
