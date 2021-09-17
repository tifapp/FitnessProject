import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import ProfilePic from 'components/ProfileImagePicker'
import BasicInfo from 'components/basicInfoComponents/BasicInfo'
import DetailedInfo from 'components/detailedInfoComponents/DetailedInfo';
import useUserDatabase from 'hooks/useUserDatabase';
import { Auth } from "aws-amplify";
import { Platform } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import CheckBox from '@react-native-community/checkbox'; //when ios is supported, we'll use this
import getLocation from 'hooks/useLocation';

var styles = require('styles/stylesheet');

const ProfileScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [imageChanged, setImageChanged] = useState(false);
    const [imageURL, setImageURL] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState(18);
    const [gender, setGender] = useState('');
    const [bioDetails, setBioDetails] = useState('');
    const [goalsDetails, setGoalsDetails] = useState('');
    const [bioDetailsMaxLength, setBioDetailsMaxLength] = useState(1000);
    const [goalsDetailsMaxLength, setGoalsDetailsMaxLength] = useState(1000);
    const [initialFields, setInitialFields] = useState([]);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [loadUserAsync, updateUserAsync, updateUserLocationAsync, deleteUserAsync] = useUserDatabase();
    
    const goToMyGroups = () => {
        navigation.navigate('My Groups')
    }

    async function signOut() {
        console.log("user is signing out.");
        if (areFieldsUpdated()) {
            const title = 'Your profile has unsaved changes!';
            const message = 'Signing out will remove these changes';
            const options = [
                { text: 'Submit changes', onPress: () => {submitHandler()} }, //if submithandler fails user won't know
                { text: 'Just sign out', onPress: () => {Auth.signOut()} },
                { text: 'Cancel', type: 'cancel', },
            ];
            Alert.alert(title, message, options, { cancelable: true });
        } else {
            Auth.signOut();
        }
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

    const areFieldsUpdated = () => {
        console.log(initialFields);
        if (name == initialFields[0] &&
            age == initialFields[1] &&
            gender == initialFields[2] &&
            bioDetails == initialFields[3] &&
            goalsDetails == initialFields[4] &&
            locationEnabled == initialFields[5] &&
            !imageChanged) {
            return false;
        }
        return true;
    }

    const submitHandler = () => {
        if (name == '') {
            Alert.alert('Please enter your name!')
        }
        else {
            Alert.alert('Submitting Profile...', '', [], { cancelable: false })
            updateUserAsync(imageURL, name, age, gender, bioDetails, goalsDetails, locationEnabled ? getLocation() : null)
                .then(([user, id]) => {
                    if (route.params?.newUser) {
                        route.params?.setUserIdFunction(id);
                    } 
                    Alert.alert("Profile submitted successfully!");
                })
            setInitialFields([name, age, gender, bioDetails, goalsDetails, locationEnabled])
            setImageChanged(false)
        }
    }

    useEffect(() => {
        if (locationEnabled) updateUserLocationAsync(getLocation(true));
        setLoading(true);
        loadUserAsync()
            .then(user => {
                if (user != null) {
                    setName(user.name);
                    setAge(user.age);
                    setGender(user.gender);
                    setBioDetails(user.bio);
                    setGoalsDetails(user.goals);
                    setLocationEnabled(user.latitude != null);
                    setInitialFields([user.name, user.age, user.gender, user.bio, user.goals, user.latitude != null]);
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
            <ScrollView style={styles.containerStyle} >
                <View style={styles.signOutTop}>
                    <TouchableOpacity style={styles.unselectedButtonStyle} color="red" onPress={signOut}>
                        <Text style={styles.unselectedButtonTextStyle}>Sign Out</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.unselectedButtonStyle} color="red" onPress={deleteAccount}>
                        <Text style={styles.unselectedButtonTextStyle}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 15 }}>
                    <ProfilePic imageURL={imageURL} setImageURL={setImageURL} setImageChanged={setImageChanged} />
                    <BasicInfo
                        name={name}
                        setName={setName}
                        age={age}
                        setAge={setAge}
                        gender={gender}
                        setGender={setGender}
                    />
                </View>
                <DetailedInfo
                    bioDetails={bioDetails}
                    goalsDetails={goalsDetails}
                    bioDetailsMaxLength={bioDetailsMaxLength}
                    goalsDetailsMaxLength={goalsDetailsMaxLength}
                    setBioDetails={setBioDetails}
                    setGoalsDetails={setGoalsDetails}
                />
                <TouchableOpacity style={[styles.rowContainerStyle, {marginBottom: 20}]} onPress={() => {setLocationEnabled(!locationEnabled)}} >
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
                <View style = {{flexDirection: 'row', justifyContent: 'center'}}>
                    <TouchableOpacity style={[styles.buttonStyle, { marginBottom: 25, marginHorizontal: 5}]} onPress={goToMyGroups} >
                        <Text style={styles.buttonTextStyle}>My Groups</Text>
                    </TouchableOpacity>
                </View>
            
                {
                    areFieldsUpdated() === true ?
                        <TouchableOpacity style={[styles.buttonStyle, { marginBottom: 25 }]} onPress={submitHandler} >
                            <Text style={styles.buttonTextStyle}>Submit</Text>
                        </TouchableOpacity>
                    : null
                }
            </ScrollView>
        )
    }
}

export default ProfileScreen;