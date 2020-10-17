import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Storage } from "aws-amplify";

var styles = require('../styles/stylesheet');

export const ProfileImage = (props) => { //user is required in props. it's a type of object described in userschema.graphql
    const [imageURL, setImageURL] = useState('');

    useEffect(() => {
        Storage.get('profileimage.jpg', { level: 'protected', identityId: props.user.identityId }) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
            .then((imageURL) => { //console.log("found profile image!", imageURL); 
                Image.getSize(imageURL, () => {
                    setImageURL(imageURL);
                }, err => {
                    setImageURL('')
                });
            })
            .catch((err) => { console.log("could not find image!", err) }) //should just use a "profilepic" component
    }, []);

    return (
        <Image 
            style={[props.style]}
            source={imageURL === '' ? require('../assets/icon.png') : { uri: imageURL }}
        />
    )
}