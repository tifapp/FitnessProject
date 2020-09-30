import React from 'react';
import {View, StyleSheet, Image, TouchableOpacity, Alert} from 'react-native';
import usePhotos from '../hooks/usePhotos';


const ProfilePic = ({imageURL, setImageURL, setImageChanged} ) => {
    const [pickFromGallery, pickFromCamera] = usePhotos();

    const promptUser = () => {
        const title = 'Select a profile pic!';
        const options = [
            { text: 'Take a pic', onPress: () => pickFromCamera(setImageURL, setImageChanged) },
            { text: 'Select a pic from photos', onPress: () => pickFromGallery(setImageURL, setImageChanged) },
            { text: 'Remove pic', onPress: () => {
                if (imageURL !== '') setImageChanged(true);
                setImageURL('');
            } },
            { text: 'Cancel', type: 'cancel', },
        ];
        Alert.alert(title, '', options, { cancelable: true });
    }

    return (
        <View>
            <TouchableOpacity
                onPress = {() => promptUser()}
            >
                <Image 
                    style = {styles.imageStyle}
                    source = {imageURL === '' ? require('../assets/icon.png') : { uri: imageURL }}
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