import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Button, Image, Dimensions} from 'react-native';
import { Auth} from "aws-amplify";
import { StackActions, NavigationActions } from 'react-navigation';
import { ProfileImage } from 'components/ProfileImage'

var styles = require('styles/stylesheet');

const LookupUser = ({ route, navigation }) => {

    const { user } = route.params;

    console.log("checking out the profile of ", user.name);

    return (
        <ScrollView>
            <View>
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
                </View>
        </ScrollView>
    )
}

export default LookupUser;