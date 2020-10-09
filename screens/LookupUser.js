import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Button, Image, Dimensions} from 'react-native';
import ProfilePic from '../components/ProfilePic'
import BasicInfo from '../components/basicInfoComponents/BasicInfo'
import DetailedInfo from '../components/detailedInfoComponents/DetailedInfo';
import useDatabase from '../hooks/useDatabase';
import { Auth} from "aws-amplify";
import { StackActions, NavigationActions } from 'react-navigation';

var styles = require('../styles/stylesheet');

const LookupUser = ({ route, navigation }) => {

    const { name, gender, goals, age, picture, bio } = route.params;

    console.log(name);

    return (
        <ScrollView>
            <View>
            <View style={styles.border}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                    <Text style={styles.buttonTextStyle}>Go Back</Text>
                </TouchableOpacity>
                <View>
                    <View style={styles.viewProfileScreen}>
                        <Text>Name: {name}</Text>
                    </View>
                    <View style={styles.viewProfileScreen}>
                        <Text>Gender: {gender}</Text>
                    </View>
                    <View style={styles.viewProfileScreen}>
                        <Text>Age: {age}</Text>
                    </View>
                    <View style={styles.viewProfileScreen}>
                        <Text>Bio: </Text>
                    </View>
                </View>
                 
                {/* 
                <View style={{paddingBottom: 15}}>
                 
                <Image 
                    style = {styles.imageStyle}
                    source = {picture === '' ? require('../assets/icon.png') : { uri: picture }}
                />
                </View>
                */}
                </View>
                <Text style={styles.textBoxStyle}>{bio}</Text>
                <View style={styles.viewProfileScreen}>
                    <Text>Goals: </Text>
                </View>
            <Text style={styles.textBoxStyle}>{goals}</Text>
                </View>
        </ScrollView>
    )
}

export default LookupUser;