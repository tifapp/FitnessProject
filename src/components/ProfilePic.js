import React, {useState} from 'react';
import {View, StyleSheet, Text, Button, Image, TouchableOpacity, Modal} from 'react-native';
import usePhotos from '../hooks/usePhotos';


const ProfilePic = () => {
    const [imageURL, setImageURL] = useState('')
    const [pickFromGallery, pickFromCamera] = usePhotos();

    return (
        <View>
            <TouchableOpacity
                onPress = {() => pickFromGallery(setImageURL)}
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
        height: 100,
        width: 100,
        borderRadius: 10,
    }
})

export default ProfilePic;