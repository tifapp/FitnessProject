import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Image, Linking, Platform, TextInput } from 'react-native';
import ProfilePic from 'components/ProfileImagePicker'
import DetailedInfo from 'components/detailedInfoComponents/DetailedInfo';
import { Auth, API, graphqlOperation, Cache, Storage } from "aws-amplify";
import { Ionicons } from "@expo/vector-icons";
import CheckBox from '@react-native-community/checkbox'; //when ios is supported, we'll use this
import getLocation from 'hooks/useLocation';
import { createUser, updateUser, deleteUser } from '../src/graphql/mutations'
import { getUser } from '../src/graphql/queries'
import { saveCapitals, loadCapitals } from 'hooks/stringConversion'
import BasicInfoDetails from '../components/basicInfoComponents/BasicInfoDetails';
import fetchProfileImageAsync from 'hooks/fetchProfileImage';
import * as ImageManipulator from 'expo-image-manipulator';

var styles = require('styles/stylesheet');

const ProfileScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(true);
    const [imageChanged, setImageChanged] = useState(false);
    const [imageURL, setImageURL] = useState('');
    const [name, setName] = useState('');
    const [identityId, setIdentityId] = useState();
    const [age, setAge] = useState(18);
    const [gender, setGender] = useState('Male');
    const [bioDetails, setBioDetails] = useState('');
    const [goalsDetails, setGoalsDetails] = useState('');
    const [locationEnabled, setLocationEnabled] = useState(false);

    useEffect(() => {
        if (locationEnabled) updateUserLocationAsync(getLocation(true));

        (async()=>{            
            const user = await API.graphql(graphqlOperation(getUser, { id: route.params?.myId }));
            const fields = user.data.getUser;

            console.log(fields);
    
            if (fields == null) {
                console.log("user doesn't exist, they must be making their profile for the first time");
            } else {
                const imageURL = await fetchProfileImageAsync(fields.identityId, true);
                setImageURL(imageURL);
                Cache.setItem(fields.identityId, {lastModified: "3000", imageURL: imageURL});
                global.savedUsers[route.params?.myId] = {name: loadCapitals(fields.name), imageURL: imageURL};
                
                setIdentityId(fields.identityId);
                setName(loadCapitals(fields.name));
                setAge(fields.age);
                setGender(fields.gender);
                setBioDetails(loadCapitals(fields.bio));
                setGoalsDetails(loadCapitals(fields.goals));
                setLocationEnabled(fields.latitude != null);
            }

            setLoading(false);
        })();
    }, [])
    
    useEffect(() => {
        if (!route.params?.newUser && !loading) {
            updateUserAsync({ age: age, gender: gender, bio: saveCapitals(bioDetails), goals: saveCapitals(goalsDetails), latitude: locationEnabled ? getLocation().latitude : null, longitude: locationEnabled ? getLocation().longitude : null }) //add a debounce on the textinput, or just when the keyboard is dismissed
        }
    }, [age, gender, bioDetails, goalsDetails, locationEnabled])

    const saveProfilePicture = async () => {
        if (imageURL != '') {
            const resizedPhoto = await ImageManipulator.manipulateAsync( //should be doing this in the backend. but if we can just make sure they're using the app to upload and not a third party app, maybe we wont need it?
                imageURL,
                [{ resize: { width: 300 } }], // resize to width of 300 and preserve aspect ratio 
                { compress: 1, format: 'jpeg' },
            );
            const response = await fetch(resizedPhoto.uri);
            const blob = await response.blob();

            await Storage.put('profileimage.jpg', blob, { level: 'protected', contentType: 'image/jpeg' });

            console.log("changing cached profile pic");
            Cache.setItem(identityId, { lastModified: "3000", imageURL: imageURL });
            global.savedUsers[route.params?.myId] = { name: name, imageURL: imageURL };
        } else {
            Storage.remove('profileimage.jpg', { level: 'protected' })
                .then(result => console.log("removed profile image!", result))
                .catch(err => console.log(err));
            Cache.setItem(identityId, { lastModified: "3000", imageURL: '' });
            global.savedUsers[route.params?.myId] = { name: name, imageURL: '' };
        }
    }

    const updateUserAsync = async (profileInfo, isNewUser) => {
        //if user doesn't exist, make one
        try {
            if (isNewUser) {
                const { identityId } = await Auth.currentCredentials();
                profileInfo.identityId = identityId;
            }

            try {
                await API.graphql(graphqlOperation(isNewUser ? createUser : updateUser, { input: profileInfo }));
                if (isNewUser) Alert.alert("Profile submitted successfully!");
                //console.log("updated user successfully");
            } catch (err) {
                Alert.alert("Could not submit profile! Error: ", err.errors[0].message);
                //console.log("error when updating user: ", err);
            }

            return [profileInfo, route.params?.myId];
        }
        catch (err) {
            console.log("error: ", err);
        }
    };

    const updateUserLocationAsync = async (location) => {
        //if user doesn't exist, make one
        try {
            const user = await API.graphql(graphqlOperation(getUser, { id: route.params?.myId }));
            const fields = user.data.getUser;
            console.log('returning users fields looks like', fields);

            const ourUser = {
                //id: query.attributes.sub,
                latitude: location == null || location.latitude < 0 ? null : location.latitude, //we need to do this in the createuser/updateuser operations as well
                longitude: location == null || location.latitude < 0 ? null : location.longitude
            };

            if (fields != null) {
                await API.graphql(graphqlOperation(updateUser, { input: ourUser }));
            }
        }
        catch (err) {
            console.log("error: ", err);
        }
    }

    const updateDetailedInfo = () => {
        if (route.params?.updatedField) {
            const label = route.params.label
            const updatedField = route.params.updatedField
            if (label == 'bio') {
                setBioDetails(updatedField)
            }
            else if (label == 'goals') {
                setGoalsDetails(updatedField)
            }
        }
    }

    const createNewUser = () => {
        if (name == '') {
            Alert.alert('Please enter your name!')
        }
        else {
            Alert.alert('Submitting Profile...', '', [], { cancelable: false })
            updateUserAsync({ name: saveCapitals(name), age: age, gender: gender, bio: saveCapitals(bioDetails), goals: saveCapitals(goalsDetails), latitude: locationEnabled ? getLocation().latitude : null, longitude: locationEnabled ? getLocation().longitude : null }, true) //add a debounce on the textinput, or just when the keyboard is dismissed
                .then(([user, id]) => {
                    route.params?.setUserIdFunction(id);
                })
            setImageChanged(false)
        }
    }

    useEffect(() => { if (!loading) {saveProfilePicture(), setImageChanged(false)} }, [imageChanged])
    useEffect(() => { updateDetailedInfo() }, [route.params?.updatedField])

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                color="#26c6a2"
                style={{
                    flex: 1,
                    justifyContent: "center",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    padding: 10,
                }} />
        )
    } else {
        return (
            <ScrollView style={[styles.containerStyle, { backgroundColor: "#efefef" }]} >
                <View style={{ margin: 20, flexDirection: "row" }}>
                    <ProfilePic imageURL={imageURL} setImageURL={setImageURL} setImageChanged={setImageChanged} />

                    <View style={{ alignItems: "flex-start", justifyContent: "space-between", marginLeft: 15, flex: 1 }}>
                        <View>
                            <TextInput
                                style={[name === '' ? styles.emptyTextInputStyle : { fontSize: 24, fontWeight: "bold", margin: 0, padding: 0}]}
                                multiline={true}
                                placeholder={`Enter your name!`}
                                autoCorrect={false}
                                value={name}
                                onChangeText={setName}
                                onEndEditing={() => {
                                    if (!route.params?.newUser) {
                                        updateUserAsync({ name: saveCapitals(name) }) //should be doing savecapitals in the backend
                                        global.savedUsers[route.params?.myId] = { name: name, imageURL: imageURL };
                                    }
                                }}>
                            </TextInput>

                            <BasicInfoDetails
                                age={age}
                                setAge={setAge}
                                gender={gender}
                                setGender={setGender} />
                        </View>
                    </View>
                </View>
                <DetailedInfo
                    bioDetails={bioDetails}
                    goalsDetails={goalsDetails}
                    setBioDetails={setBioDetails}
                    setGoalsDetails={setGoalsDetails}
                />
                <TouchableOpacity style={[styles.rowContainerStyle, { marginBottom: 20 }]} onPress={() => { setLocationEnabled(!locationEnabled) }} >
                    {
                        locationEnabled === true && getLocation(true) == null
                            ? <ActivityIndicator
                                size="small"
                                color="#26c6a2"
                                style={{
                                    padding: 6,
                                }} />
                            : Platform.OS === 'android'
                                ? <CheckBox
                                    disabled={true}
                                    value={locationEnabled}
                                />
                                : locationEnabled === false
                                    ? <Ionicons size={16} style={{ marginBottom: 0 }} name="md-square-outline" color="orange" />
                                    : <Ionicons size={16} style={{ marginBottom: 0 }} name="md-checkbox-outline" color="orange" />
                    }
                    <Text style={styles.textButtonTextStyle}>{locationEnabled === true && getLocation(true) == null ? 'Locating user' : 'Let others see your location'}</Text>
                </TouchableOpacity>
                {
                    route.params?.newUser ? //if name is blank?
                        <TouchableOpacity style={[styles.buttonStyle, { marginBottom: 25 }]} onPress={createNewUser} >
                            <Text style={styles.buttonTextStyle}>Submit</Text>
                        </TouchableOpacity>
                        : null
                }
            </ScrollView>
        )
    }
}

export default ProfileScreen;