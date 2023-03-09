import * as ImagePicker from "expo-image-picker"
import * as MediaLibrary from "expo-media-library"
import { Alert } from "react-native"

export default (allowPics = true, allowVideo = false) => {
  const imageOptions = {
    mediaTypes: allowPics
      ? allowVideo
        ? ImagePicker.MediaTypeOptions.All
        : ImagePicker.MediaTypeOptions.Images
      : ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1
  }

  const pickFromGallery = async (setImageURL, setImageChanged, setIsVideo) => {
    const { granted } = await MediaLibrary.requestPermissionsAsync()
    if (granted) {
      const response = await ImagePicker.launchImageLibraryAsync({
        ...imageOptions,
        aspect: [1, 1]
      })
      if (!response.cancelled) {
        // @ts-ignore
        setImageURL(response.uri)
        if (setImageChanged) setImageChanged(true)
        // @ts-ignore
        if (setIsVideo) setIsVideo(response.type === "video")
      }

      console.log(response)
    } else {
      Alert.alert("Photos access denied!")
    }
  }

  const pickFromCamera = async (setImageURL, setImageChanged, setIsVideo) => {
    const { granted } = { granted: false } // await Camera.requestCameraPermissionsAsync()
    if (granted) {
      const response = await ImagePicker.launchCameraAsync({
        ...imageOptions,
        aspect: [1, 1]
      })
      if (!response.cancelled) {
        // @ts-ignore
        setImageURL(response.uri)
        if (setImageChanged) setImageChanged(true)
        // @ts-ignore
        if (setIsVideo) setIsVideo(response.type === "video")
      }

      console.log(response)
    } else {
      Alert.alert("Camera access denied!")
    }
  }

  return [pickFromGallery, pickFromCamera]
}
