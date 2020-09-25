import React from 'react';
import {View, StyleSheet, Image, TouchableOpacity, Alert} from 'react-native';
import usePhotos from '../hooks/usePhotos';


const ProfilePic = ({imageURL, setImageURL} ) => {
    const [pickFromGallery, pickFromCamera] = usePhotos();

    const promptUser = () => {
        const title = 'Choose a profile pic!';
        const message = 'Please make your selection.';
        const options = [
            { text: 'Take a pic', onPress: () => pickFromCamera(setImageURL) },
            { text: 'Select a pic from photos', onPress: () => pickFromGallery(setImageURL) },
            { text: 'Remove pic', onPress: () => setImageURL('') },
            { text: 'Cancel', type: 'cancel' },
        ];
        Alert.alert(title, message, options);
    }

    return (
        <View>
            <TouchableOpacity
                onPress = {() => promptUser()}
            >
                <Image 
                    style = {styles.imageStyle}
                    source = {imageURL === '' ? require('../../assets/icon.png') : { uri: imageURL }}
                />
            </TouchableOpacity>     
        </View>
    )
}

const styles = new StyleSheet.create({
    imageStyle: {
        alignSelf: 'center',
        marginTop: 30,
        height: 110,
        width: 110,
        borderRadius: 10,
    }
})

export default ProfilePic;