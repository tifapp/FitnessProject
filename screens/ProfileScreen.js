import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import ProfilePic from 'components/ProfileImagePicker'
import DetailedInfo from 'components/detailedInfoComponents/DetailedInfo';
import useUserDatabase from 'hooks/useUserDatabase';
import { Auth } from "aws-amplify";
import { Platform, TextInput } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import CheckBox from '@react-native-community/checkbox'; //when ios is supported, we'll use this
import getLocation from 'hooks/useLocation';
import { saveCapitals, loadCapitals } from 'hooks/stringConversion'
import BasicInfoDetails from '../components/basicInfoComponents/BasicInfoDetails';
import IconButton from "../components/IconButton";

var styles = require('styles/stylesheet');

const ProfileScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(true);
    const [imageChanged, setImageChanged] = useState(false);
    const [imageURL, setImageURL] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState(18);
    const [gender, setGender] = useState('Male');
    const [bioDetails, setBioDetails] = useState('');
    const [goalsDetails, setGoalsDetails] = useState('');
    const [bioDetailsMaxLength, setBioDetailsMaxLength] = useState(1000);
    const [goalsDetailsMaxLength, setGoalsDetailsMaxLength] = useState(1000);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [loadUserAsync, updateUserAsync, updateUserLocationAsync, deleteUserAsync] = useUserDatabase();

    const goToMyGroups = () => {
        navigation.navigate('My Groups')
    }

    async function signOut() {
        Auth.signOut();
    }

    async function deleteAccount() {
        const title = 'Are you sure you want to delete your account?';
        const message = '';
        const options = [
            {
                text: 'Yes', onPress: () => {
                    Alert.alert('Are you REALLY sure you want to delete your account?', '', [
                        {
                            text: 'Yes', onPress: () => {
                                deleteUserAsync().then(() => { Auth.signOut() }).catch()
                            }
                        }, //if submithandler fails user won't know
                        { text: 'Cancel', type: 'cancel', },
                    ], { cancelable: true });
                }
            }, //if submithandler fails user won't know
            { text: 'Cancel', type: 'cancel', },
        ];
        Alert.alert(title, message, options, { cancelable: true });
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

    useEffect(() => {
        if (!route.params?.newUser && !loading) {
            updateUserAsync({ age: age, gender: gender, bio: saveCapitals(bioDetails), goals: saveCapitals(goalsDetails), latitude: locationEnabled ? getLocation().latitude : null, longitude: locationEnabled ? getLocation().longitude : null }, imageChanged ? imageURL : null) //add a debounce on the textinput, or just when the keyboard is dismissed
            setImageChanged(false)
        }
    }, [age, gender, bioDetails, goalsDetails, locationEnabled, imageChanged])

    const createNewUser = () => {
        if (name == '') {
            Alert.alert('Please enter your name!')
        }
        else {
            Alert.alert('Submitting Profile...', '', [], { cancelable: false })
            updateUserAsync({ name: name, age: age, gender: gender, bio: saveCapitals(bioDetails), goals: saveCapitals(goalsDetails), latitude: locationEnabled ? getLocation().latitude : null, longitude: locationEnabled ? getLocation().longitude : null }, imageChanged ? imageURL : null, true) //add a debounce on the textinput, or just when the keyboard is dismissed
                .then(([user, id]) => {
                    route.params?.setUserIdFunction(id);
                    Alert.alert("Profile submitted successfully!");
                })
            setImageChanged(false)
        }
    }

    useEffect(() => {
        if (locationEnabled) updateUserLocationAsync(getLocation(true));
        loadUserAsync()
            .then(user => {
                if (user != null) {
                    setName(user.name);
                    setAge(user.age);
                    setGender(user.gender);
                    setBioDetails(user.bio);
                    setGoalsDetails(user.goals);
                    setLocationEnabled(user.latitude != null);
                    Image.getSize(user.pictureURL, () => {
                        setImageURL(user.pictureURL);
                    }, err => {
                        setImageURL('');
                    });
                }
            })
            .finally(() => { setLoading(false); })
    }, [])

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
                                style={[name === '' ? styles.emptyTextInputStyle : { fontSize: 24, fontWeight: "bold" }]}
                                multiline={true}
                                placeholder={`Enter your name!`}
                                autoCorrect={false}
                                value={name}
                                onChangeText={setName}
                                onEndEditing={() => {
                                    if (!route.params?.newUser)
                                        updateUserAsync({ name: saveCapitals(name) }) //should be doing savecapitals in the backend
                                }}>
                            </TextInput>

                            <BasicInfoDetails
                                age={age}
                                setAge={setAge}
                                gender={gender}
                                setGender={setGender} />
                        </View>

                        <View style={{ alignItems: "flex-start" }}>
                            <IconButton
                                style={{ marginBottom: 10 }}
                                iconName={"message"}
                                size={24}
                                fontSize={18}
                                color={"blue"}
                                onPress={() => undoResponseHandler(item)}
                                label={"Message"}
                            />
                        </View>
                    </View>
                </View>
                <DetailedInfo
                    bioDetails={bioDetails}
                    goalsDetails={goalsDetails}
                    bioDetailsMaxLength={bioDetailsMaxLength}
                    goalsDetailsMaxLength={goalsDetailsMaxLength}
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
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity style={[styles.buttonStyle, { marginBottom: 25, marginHorizontal: 5 }]} onPress={goToMyGroups} >
                        <Text style={styles.buttonTextStyle}>My Groups</Text>
                    </TouchableOpacity>
                </View>
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