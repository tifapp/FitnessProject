import {Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';

export default () => {

    const pickFromGallery = async(setImageURL) => {
        const {granted} = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if (granted) {
            let response = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1
            })
            if (!response.cancelled) {
                setImageURL(response.uri)
            }
            
            console.log(response)
        }
        else {
            Alert.alert('Photos access denied!')
        }
        
    }

    const pickFromCamera = async(setImageURL) => {
        const {granted} = await Permissions.askAsync(Permissions.CAMERA)
        if (granted) {
            let response = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1
            })
            if (!response.cancelled) {
                setImageURL(response.uri)
            }
            
            console.log(response)
        }
        else {
            Alert.alert('Camera access denied!')
        }
        
    }

    return [pickFromGallery, pickFromCamera];
}