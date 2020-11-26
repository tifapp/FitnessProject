import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Button, Image, Dimensions} from 'react-native';
import { Auth} from "aws-amplify";
import { StackActions, NavigationActions } from 'react-navigation';
import { ProfileImage } from 'components/ProfileImage'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import computeDistance from "hooks/computeDistance"
var styles = require('styles/stylesheet');

const LookupUser = ({ route, navigation }) => {

    const { user } = route.params;
    const { id } = route.params;
    const { location } = route.params;

    console.log("checking out the profile of ", user.name);

    useEffect(() => {
        if (location == null) {
            (async () => {
                let { status } = await Location.requestPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                }
    
                let loc = await Location.getCurrentPositionAsync({ accuracy: 2 });
                
                navigation.setParams({location: { latitude: loc.coords.latitude, longitude: loc.coords.longitude }})
            })();
        }
    }, []);

    return (
        <ScrollView>
            {
                user.id == id
                ?<TouchableOpacity 
                style={ {position: 'absolute', top: 25, right: 25, borderWidth: 1, borderRadius: 25, padding: 10}}
                onPress={() => navigation.navigate('Profile', {
                    screen: 'Profile',
                    params: { fromLookup: true },
                  })}>
                    <MaterialCommunityIcons style={styles.editIconStyle}name="dumbbell" size={24} color="black" />
                </TouchableOpacity>
                :null
            }
            <View style={styles.border}>
                {/*
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                    <Text style={styles.buttonTextStyle}>Go Back</Text>
                </TouchableOpacity>
                 */}
                
                <View style={{paddingBottom: 15}}>
                 
                <ProfileImage 
                    style = {styles.imageStyle}
                    user = {user}
                    isFull = {true}
                />
                </View>
                
                <View>
                    <View style={styles.viewProfileScreen}>
                        <Text>Name: {user.name}</Text>
                    </View>
                    <View style={styles.viewProfileScreen}>
                        <Text>Gender: {user.gender}</Text>
                    </View>
                    <View style={styles.viewProfileScreen}>
                        <Text>Age: {user.age}</Text>
                    </View>
                </View>

                </View>
                    <View style={styles.viewProfileScreen}>
                        <Text>Bio: </Text>
                    </View>
                <Text style={styles.textBoxStyle}>{user.bio}</Text>
                <View style={styles.viewProfileScreen}>
                    <Text>Goals: </Text>
                </View>
            <Text style={styles.textBoxStyle}>{user.goals}</Text>
            {
                location != null && user.latitude != null
                ? <Text>{computeDistance([location.latitude, location.longitude], [user.latitude, user.longitude])} mi. away</Text>
                : null
            }
        </ScrollView>
    )
}

export default LookupUser;