import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, } from 'react-native';
import { Cache, Storage } from "aws-amplify";

var styles = require('../styles/stylesheet');

//currently the predicted behavior is that it will cache images but the links will be invalid after 15 minutes-1 hour. let's see.

export const ProfileImage = (props) => { //user is required in props. it's a type of object described in userschema.graphql
    const [imageURL, setImageURL] = useState('');

    const addURLtoCache = () => {
        console.log('cache missed!'); //this isn't printing for some reason
        //console.log("this identity id is...", props.user.identityId); //seems to fix the profile images on the feed screen, idk why
        if (props.isFull) {
            Storage.get('profileimage.jpg', { level: 'protected', identityId: props.user.identityId }) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
            .then((imageURL) => { //console.log("found profile image!", imageURL); 
                Image.getSize(imageURL, () => {
                    //if (mounted) {
                        Cache.setItem(props.user.id, imageURL, { expires: Date.now() + 86400000 }); //profile pic url is cached for 1 day, hopefully it doesnt expire till then
                        setImageURL(imageURL);
                    //}
                }, err => {
                    //if (mounted) {
                        Cache.setItem(props.user.id, '', { expires: Date.now() + 86400000 });
                        setImageURL('');
                    //}
                });
            })
            .catch((err) => { console.log("could not find image!", err) }) //should just use a "profilepic" component
        } else {
            //const region = aws_config.aws_user_files_s3_bucket_region;

            Storage.get(`thumbnails/protected/us-west-2:${props.user.identityId}/profileimage.jpg/thumbnail-profileimage.jpg`) //idk if this will work in other regions
                .then((imageURL) => { //console.log("found profile image!", imageURL); 
                    Image.getSize(imageURL, () => {
                        //if (mounted) {
                            Cache.setItem(props.user.id, imageURL, { expires: Date.now() + 86400000 }); //profile pic url is cached for 1 day, hopefully it doesnt expire till then
                            setImageURL(imageURL);
                        //}
                    }, err => {
                        //if (mounted) {
                            Cache.setItem(props.user.id, '', { expires: Date.now() + 86400000 });
                            setImageURL('');
                        //}
                    });
                })
                .catch((err) => { console.log("could not find image!", err) }) //should just use a "profilepic" component
        }
        return 'loading...';
    }

    useEffect(() => {
        Cache.getItem(props.user.id, { callback: addURLtoCache }) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
        .then((url)=>{
            //console.log('cache hit! ', url.substring(0, 15), '...');
            setImageURL(url)});
        //return () => mounted = false;
    }, [props.user]);

    if (imageURL == 'loading...') {
        return (
            <ActivityIndicator
                color="#0000ff"
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