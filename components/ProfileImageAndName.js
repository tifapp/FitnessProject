import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, Text, } from 'react-native';
import { Cache, Storage } from "aws-amplify";
import { API, graphqlOperation } from "aws-amplify";
import { getUser } from "../src/graphql/queries";
import { useNavigation } from '@react-navigation/native';

var styles = require('../styles/stylesheet');

//currently the predicted behavior is that it will cache images but the links will be invalid after 15 minutes-1 hour. let's see.

export const ProfileImageAndName = (props) => { //user is required in props. it's a type of object described in userschema.graphql
    const navigation = useNavigation();
    const goToProfile = () => {
        if (props.navigation == false) {
            if (props.you)
                navigation.navigate('Profile', {
                    screen: 'Profile',
                    params: { fromLookup: true },
                })
            else
                navigation.navigate('Messages', {userId: props.userId})
        }
        else {
            navigation.push('Lookup',
                { userId: props.userId })
        }
    }


    const [userInfo, setUserInfo] = useState(null);

    const addUserInfotoCache = () => {
        //console.log('cache missed!', props.userId); //this isn't printing for some reason
        API.graphql(
            graphqlOperation(getUser, { id: props.userId })
        )
            .then((u) => {
                const user = u.data.getUser;
                if (user != null) {
                    const info = { name: user.name, imageURL: '', isFull: props.isFull };
                    if (props.isFull) { //since this only runs during cache misses, we'll probably never see this. maybe we'll need a new index with a very low priority. it'll definitely need to be cached and shown when viewing someone's profile.
                        //console.log("showing full image");
                        Storage.get('profileimage.jpg', { level: 'protected', identityId: user.identityId }) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
                            .then((imageURL) => {
                                Image.getSize(imageURL, () => {
                                    //if (mounted) {
                                    info.imageURL = imageURL;
                                    Cache.setItem(props.userId, info, { expires: Date.now() + 86400000 });
                                    setUserInfo(info);
                                    //}
                                }, err => {
                                    //console.log("couldn't find user's profile image");
                                    Cache.setItem(props.userId, info, { expires: Date.now() + 86400000 });
                                    setUserInfo(info);
                                });
                            })
                            .catch((err) => { console.log("could not find image!", err) }) //should just use a "profilepic" component
                    } else {
                        //const region = aws_config.aws_user_files_s3_bucket_region;
                        //console.log("showing thumb image");

                        Storage.get(`thumbnails/${user.identityId}/thumbnail-profileimage.jpg`) //idk if this will work in other regions
                            .then((imageURL) => {
                                Image.getSize(imageURL, () => {
                                    //if (mounted) {
                                    info.imageURL = imageURL;
                                    Cache.setItem(props.userId, info, { expires: Date.now() + 86400000 }); //profile pic url is cached for 1 day, hopefully it doesnt expire till then
                                    setUserInfo(info);
                                    //}
                                }, err => {
                                    //console.log("couldn't find user's thumbnail");
                                    Cache.setItem(props.userId, info, { expires: Date.now() + 86400000 });
                                    setUserInfo(info);
                                });
                            })
                            .catch((err) => { console.log("could not find image!", err) }) //should just use a "profilepic" component
                    }
                }
            });
        return null;
    }

    useEffect(() => {
        Cache.getItem(props.userId, { callback: addUserInfotoCache }) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
            .then((info) => {
                //console.log('cache hit! ', props.userId);
                if (info.imageURL !== '' && props.isFull && !info.isFull) {
                    addUserInfotoCache();
                } else {
                    setUserInfo(info);
                }
            }); //redundant???
        //return () => mounted = false;
    }, [props.user]);

    if (userInfo == null) {
        return (
            <ActivityIndicator
                color="#0000ff"
                style={[props.style]}
            />
        )
    } else {
        return (
            <TouchableOpacity
                onPress={goToProfile}
                style={{ flexDirection: props.vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <Image
                    style={[props.style, {marginBottom: props.vertical ? 15 : 0, marginRight: props.vertical ? 0 : 15}]}
                    source={userInfo.imageURL === '' ? require('../assets/icon.png') : { uri: userInfo.imageURL }}
                />
                { props.isFull ?
                    <Text>{userInfo.name}</Text>
                    :
                    userInfo.name.length > 10 ?
                    <Text>{userInfo.name.substring(0,10)} ...</Text>
                    : <Text>{userInfo.name}</Text>
                    
                }
            </TouchableOpacity>
        )
    }
}