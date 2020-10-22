import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, } from 'react-native';
import { Storage } from "aws-amplify";

var styles = require('../styles/stylesheet');

export const ProfileImage = (props) => { //user is required in props. it's a type of object described in userschema.graphql
    const [imageURL, setImageURL] = useState('');

    useEffect(() => {
        let mounted = true;
        setImageURL('loading...');
        console.log("this identity id is...", props.user.identityId); //seems to fix the profile images on the feed screen, idk why
        Storage.get('profileimage.jpg', { level: 'protected', identityId: props.user.identityId }) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
            .then((imageURL) => { //console.log("found profile image!", imageURL); 
                Image.getSize(imageURL, () => {
                    if (mounted) {
                        setImageURL(imageURL);
                    }
                }, err => {
                    if (mounted) {
                        setImageURL('');
                    }
                });
            })
            .catch((err) => { console.log("could not find image!", err) }) //should just use a "profilepic" component

        return () => mounted = false;
    }, [props.user]);

    if (imageURL == 'loading...') {
        return (
            <ActivityIndicator
                style={[props.style]}
            />
        )
    } else {
        return (
            <Image 
                style={[props.style]}
                source={imageURL === '' ? require('../assets/icon.png') : { uri: imageURL }}
            />
        )
    }
}