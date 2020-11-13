import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import ProfilePic from 'components/ProfileImagePicker'
import BasicInfo from 'components/basicInfoComponents/BasicInfo'
import DetailedInfo from 'components/detailedInfoComponents/DetailedInfo';
import useDatabase from 'hooks/useDatabase';
import { Auth } from "aws-amplify";
import { StackActions, NavigationActions } from 'react-navigation';

var styles = require('styles/stylesheet');

const ProfileScreen = ({ navigation, route }) => {

    const goToMyGroups = () => {
        navigation.navigate('My Groups')
      }

    async function signOut() {
        console.log("user is signing out.");
        if (areFieldsUpdated()) {
            const title = 'Your profile has unsubmitted changes!';
            const message = '';
            const options = [
                { text: 'Submit changes', onPress: submitHandler }, //if submithandler fails user won't know
                { text: 'Just sign out', onPress: Auth.signOut },
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

    const [loadUserAsync, updateUserAsync, deleteUserAsync] = useDatabase();

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
            !imageChanged) {
            return false;
        }
        return true;
    }

    const submitHandler = () => {
        if (name == '') {
            Alert.alert('Please enter your name!')
        }
        else if (!areFieldsUpdated()) {
            Alert.alert('Profile is up to date!')
        }
        else {
            Alert.alert('Submitting Profile...', '', [], { cancelable: false })
            updateUserAsync(imageURL, name, age, gender, bioDetails, goalsDetails)
                .then((userId) => {
                    if (route.params?.newUser) {
                        route.params?.setUserIdFunction(userId);
                    }
                    Alert.alert("Profile submitted successfully!");
                })
            setInitialFields([name, age, gender, bioDetails, goalsDetails])
            setImageChanged(false)
        }
    }

    useEffect(() => {
        setLoading(true);
        loadUserAsync()
            .then(user => {
                if (user != null) {
                    setName(user.name);
                    setAge(user.age);
                    setGender(user.gender);
                    setBioDetails(user.bio);
                    setGoalsDetails(user.goals);
                    setInitialFields([user.name, user.age, user.gender, user.bio, user.goals]);
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
                color="#0000ff"
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
            <ScrollView style={styles.containerStyle}>
                <View style={styles.signOutTop}>
                    <TouchableOpacity style={styles.unselectedButtonStyle} color="red" onPress={signOut}>
                        <Text style={styles.unselectedButtonTextStyle}>Sign Out</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.unselectedButtonStyle} color="red" onPress={deleteAccount}>
                        <Text style={styles.unselectedButtonTextStyle}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingBottom: 15 }}>
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
                <TouchableOpacity style={[styles.buttonStyle, { marginBottom: 25 }]} onPress={goToMyGroups} >
                    <Text style={styles.buttonTextStyle}>My Groups</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttonStyle, { marginBottom: 25 }]} onPress={submitHandler} >
                    <Text style={styles.buttonTextStyle}>Submit</Text>
                </TouchableOpacity>
            </ScrollView>
        )
    }
}

export default ProfileScreen;