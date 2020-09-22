import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, Button, ScrollView} from 'react-native';
import ProfilePic from '../components/ProfilePic'
import BasicInfo from '../components/basicInfoComponents/BasicInfo'
import DetailedInfo from '../components/detailedInfoComponents/DetailedInfo';


const ProfileScreen = ({navigation, route}) => {
    const [bioDetails, setBioDetails] = useState('')
    const [goalsDetails, setGoalsDetails] = useState('')
    
    const updateDetailedInfo = () => {
        if (route.params?.updatedField) {
            if (route.params.label == 'bio') {
                setBioDetails(route.params.updatedField)
                console.log(route.params.updatedField)
            }
            else if (route.params.label == 'goals') {
                setGoalsDetails(route.params.updatedField)
                console.log(route.params.updatedField)
            }
        }
    }

    useEffect(() => { updateDetailedInfo() }, [route.params?.updatedField])

    return (
        <ScrollView style = {styles.containerStyle}>
            <View style = {styles.upperScreenStyle}>
                <ProfilePic />
                <BasicInfo />
            </View>
            <DetailedInfo 
                bioDetails = {bioDetails} 
                goalsDetails = {goalsDetails}
                setBioDetails = {setBioDetails}
                setGoalsDetails = {setGoalsDetails}
            />
        </ScrollView>
    )
}

const styles = new StyleSheet.create({
    containerStyle: {
        flex: 1,
        backgroundColor: '#d3d3d3'
    },
    upperScreenStyle: {
        backgroundColor: '#ADD8E6',
        marginBottom: 30,
    },

})

export default ProfileScreen;