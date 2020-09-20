import React from 'react';
import {View, StyleSheet, Text, Button, ScrollView} from 'react-native';
import ProfilePic from '../components/ProfilePic'
import BasicInfo from '../components/BasicInfo'
import DetailedInfo from '../components/DetailedInfo';


const ProfileScreen = ({navigation}) => {
    return (
        <ScrollView style = {styles.containerStyle}>
            <View style = {styles.upperScreenStyle}>
                <ProfilePic />
                <BasicInfo />
            </View>
            <DetailedInfo navigation = {navigation} />
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