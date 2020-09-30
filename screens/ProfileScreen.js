import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import ProfilePic from '../components/ProfilePic'
import BasicInfo from '../components/basicInfoComponents/BasicInfo'
import DetailedInfo from '../components/detailedInfoComponents/DetailedInfo';
import useDatabase from '../hooks/useDatabase';
import { Auth} from "aws-amplify";
import { StackActions, NavigationActions } from 'react-navigation';

var styles = require('../styles/stylesheet');

const ProfileScreen = ({ navigation, route }) => {
    async function signOut() {
        try {
            await Auth.signOut();
        } catch (error) {
            console.log("error");
        }
    }

    const [imageChanged, setImageChanged] = useState(false);
    const [imageURL, setImageURL] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [bioDetails, setBioDetails] = useState('');
    const [goalsDetails, setGoalsDetails] = useState('');

    const [initialFields, setInitialFields] = useState([]);

    const [loadUserAsync, updateUserAsync] = useDatabase();

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
            updateUserAsync(imageURL, name, age, gender, bioDetails, goalsDetails)
            Alert.alert('Profile updated!')
            setInitialFields([name, age, gender, bioDetails, goalsDetails])
            setImageChanged(false)
        }
        if (route.params?.newUser) {
            route.params?.setUserNullFunction(false);
        }
    }

    useEffect(() => {
        loadUserAsync(setImageURL, setName, setAge, setGender, setBioDetails, setGoalsDetails, setInitialFields)
    }, [])

    useEffect(() => { updateDetailedInfo() }, [route.params?.updatedField])

    return (
        <ScrollView style={styles.containerStyle}>
            <View style={styles.signOutTop}>
                <TouchableOpacity style={styles.unselectedButtonStyle} color="red" onPress={signOut}>
                    <Text style={styles.unselectedButtonTextStyle}>Sign Out</Text>
                </TouchableOpacity>
            </View>
            <View style={{paddingBottom: 15}}>
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
                setBioDetails={setBioDetails}
                setGoalsDetails={setGoalsDetails}
            />
            <TouchableOpacity style={[styles.buttonStyle, {marginBottom: 25}]} onPress={submitHandler} >
                <Text style={styles.buttonTextStyle}>Submit</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

export default ProfileScreen;