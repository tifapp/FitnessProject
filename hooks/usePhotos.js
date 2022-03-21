import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";

export default (allowVideo = false) => {
  const pickFromGallery = async (setImageURL, setImageChanged, setIsVideo) => {
    const { granted } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    if (granted) {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: allowVideo
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!response.cancelled) {
        setImageURL(response.uri);
        if (setImageChanged) setImageChanged(true);
        if (setIsVideo) setIsVideo(response.type === "video");
      }

      console.log(response);
    } else {
      Alert.alert("Photos access denied!");
    }
  };

  const pickFromCamera = async (setImageURL, setImageChanged, setIsVideo) => {
    const { granted } = await Permissions.askAsync(Permissions.CAMERA);
    if (granted) {
      let response = await ImagePicker.launchCameraAsync({
        mediaTypes: allowVideo
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!response.cancelled) {
        setImageURL(response.uri);
        if (setImageChanged) setImageChanged(true);
        if (setIsVideo) setIsVideo(response.type === "video");
      }

      console.log(response);
    } else {
      Alert.alert("Camera access denied!");
    }
  };

  return [pickFromGallery, pickFromCamera];
};
