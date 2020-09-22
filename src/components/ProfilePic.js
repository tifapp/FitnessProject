import React, {useState} from 'react';
import {View, StyleSheet, Text, Button, Image, TouchableOpacity, Alert} from 'react-native';
import { set } from 'react-native-reanimated';
import usePhotos from '../hooks/usePhotos';


const ProfilePic = () => {
    const [imageURL, setImageURL] = useState('')
    const [pickFromGallery, pickFromCamera] = usePhotos();
    //pickFromCamera(setImageURL)

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