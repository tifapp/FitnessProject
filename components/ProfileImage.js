import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, } from 'react-native';
import { Cache, Storage } from "aws-amplify";

var styles = require('../styles/stylesheet');

export const ProfileImage = (props) => { //user is required in props. it's a type of object described in userschema.graphql
    const [imageURL, setImageURL] = useState('');

    const addURLtoCache = () => {
        console.log('cache missed!'); //this isn't printing for some reason
        setImageURL('loading...');
        //console.log("this identity id is...", props.user.identityId); //seems to fix the profile images on the feed screen, idk why
        Storage.get('profileimage.jpg', { level: 'protected', identityId: props.user.identityId }) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
            .then((imageURL) => { //console.log("found profile image!", imageURL); 
                Image.getSize(imageURL, () => {
                    if (mounted) {
                        Cache.setItem(props.user.id, imageURL);
                        setImageURL(imageURL);
                    }
                }, err => {
                    if (mounted) {
                        Cache.setItem(props.user.id, '');
                        setImageURL('');
                    }
                });
            })
            .catch((err) => { console.log("could not find image!", err) }) //should just use a "profilepic" component
    }

    useEffect(() => {
        let mounted = true; //to prevent the "unmounted update" warning
        Cache.getItem(props.user.id, { callback: addURLtoCache }) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
        .then((url)=>{
            console.log(url);
            setImageURL(url)});
        return () => mounted = false;
    }, [props.user]);

    if (imageURL == 'loading...') {
        return (
            <ActivityIndicator
                color="#0000ff"
                style={[props.style]}
            />
        )
    } else {
        return ( //source={imageURL === '' ? require('../assets/icon.png') : { uri: imageURL }}
            <Image 
                style={[props.style]}
                source={require('../assets/icon.png')}
            />
        )
    }
}