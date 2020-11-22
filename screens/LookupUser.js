import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Button, Image, Dimensions} from 'react-native';
import { Auth} from "aws-amplify";
import { StackActions, NavigationActions } from 'react-navigation';
import { ProfileImage } from 'components/ProfileImage'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
var styles = require('styles/stylesheet');

const LookupUser = ({ route, navigation }) => {

    const { userId } = route.params;
    const { id } = route.params;

    console.log("checking out the profile of ", user.name);
    
    const [user, setUser] = useState({});

    const checkUsersInfo = async () => {
        try {
        const user = await API.graphql(
            graphqlOperation(getUser, { id: item.userId })
        );
        if (user.data.getUser != null) {
            //console.log("this post is...", item.description, "and the author is...", user.data.getUser);
            setUser(user.data.getUser);
        }

        //console.log("success, user is ", user);
        } catch (err) {
        console.log("error in finding user ", err);
        }
    };

    useEffect(() => {
        checkUsersInfo();
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
        </ScrollView>
    )
}

export default LookupUser;