import React, { useState, useEffect } from 'react';
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
} from "react-native";

import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { listFriendRequests, friendRequestsByReceiver, listFriendships, getFriendship, friendsBySecondUser } from "root/src/graphql/queries";
import { createFriendRequest, deleteFriendRequest, deleteFriendship } from "root/src/graphql/mutations";
import { ProfileImageAndName } from 'components/ProfileImageAndName'
import APIList from 'components/APIList';

import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

Amplify.configure(awsconfig);

var styles = require('styles/stylesheet');

const FriendScreen = ({ route, navigation }) => {
    const [friendsEnabled, setFriendsEnabled] = useState(true);
    const [friendList, setFriendList] = useState([]);
    const [friendRequestList, setFriendRequestList] = useState([]);

    const findFriendID = (item) => {
        if (route.params?.id == item.user1) return item.user2;
        if (route.params?.id == item.user2) return item.user1;
    }

    const removeFriendHandler = (item) => {
        const title = 'Are you sure you want to remove this friend?';
        const options = [
            { text: 'Yes', onPress: () => removeFriend(item) },
            { text: 'Cancel', type: 'cancel', },
        ];
        Alert.alert(title, '', options, { cancelable: true });
    }

    const rejectRequest = async (item) => {
        // delete friend object
        try {
            await API.graphql(graphqlOperation(deleteFriendRequest, { input: { sender: item.sender, receiver: item.receiver } }));
        }
        catch (err) {
            console.log("error: ", err);
        }
        // update friendRequestList
        setFriendRequestList((friendRequestList) => {
            return friendRequestList.filter((validItem) => (validItem.sender != item.sender && validItem.receiver != item.receiver));
        });//locally removes the item
    }

    const removeFriend = async (item) => {
        // delete friend object
        try {
            await API.graphql(graphqlOperation(deleteFriendship, { input: { user1: item.user1, user2: item.user2 } }));
        }
        catch (err) {
            console.log("error: ", err);
        }
        // update friendList
        setFriendList((friendList) => {
            return friendList.filter((i) => (i.user1 != item.user1 && i.user2 != item.user2));
        });
    }

    const acceptRequest = async (item) => {
        // accept friend request
        try {
            await API.graphql(graphqlOperation(createFriendRequest, { input: { receiver: item.sender } }));
        }
        catch (err) {
            console.log("error: ", err);
        }

        setFriendRequestList((friendRequestList) => {
            return friendRequestList.filter((i) => (i.sender != item.sender));
        });
    }

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 25 }}>
                <TouchableOpacity
                    style={(friendsEnabled) ? styles.outlineButtonStyle : styles.unselectedButtonStyle}
                    onPress={() => setFriendsEnabled(true)}>
                    <Text style={(friendsEnabled) ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(friendsEnabled) ? styles.unselectedButtonStyle : styles.outlineButtonStyle}
                    onPress={() => setFriendsEnabled(false)}>
                    <Text style={(friendsEnabled) ? styles.unselectedButtonTextStyle : styles.outlineButtonTextStyle}>Requests</Text>
                </TouchableOpacity>

            </View>
            <View style={{ marginTop: 25, alignSelf: 'center' }}>
                {friendsEnabled ?

                    <View>
                        <Text style={{ alignSelf: 'center' }}>Your awesome friends!</Text>
                        <APIList
                            queryOperation={listFriendships}
                            filter={{filter: { 
                                or: [{
                                    user1: {
                                        eq: route.params?.id
                                    }
                                },
                                {
                                    user2: {
                                        eq: route.params?.id
                                    }
                                }]
                            }}}
                            setDataFunction={setFriendList}
                            keyExtractor={(item) => item.timestamp.toString()}
                            data={friendList}
                            renderItem={({ item }) => (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, justifyContent: 'space-between', width: '80%' }}>
                                    <ProfileImageAndName
                                        style={styles.smallImageStyle}
                                        userId={findFriendID(item)}
                                    />
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 15 }}
                                        onPress={() => removeFriendHandler(item)}>
                                        <Text>Remove</Text>
                                        <Entypo name="cross" style={{ marginHorizontal: 7 }}
                                            size={44} color="red" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>

                    :

                    <View>
                        <Text style={{ alignSelf: 'center' }}>Incoming Requests!</Text>
                        <APIList
                            queryOperation={friendRequestsByReceiver}
                            filter={{receiver: route.params?.id}}
                            setDataFunction={setFriendRequestList}
                            keyExtractor={(item) => item.sender}
                            data={friendRequestList}
                            renderItem={({ item }) => (
                                <View style={{ marginVertical: 5 }}>
                                    <View style={{ flexDirection: 'column', alignSelf: 'center', marginVertical: 5, justifyContent: 'space-between', width: '80%' }}>
                                        <ProfileImageAndName
                                            style={styles.smallImageStyle}
                                            userId={item.sender}
                                        />
                                        <View style={{ flexDirection: 'row', alignSelf: 'center', marginVertical: 5, justifyContent: 'space-between', width: '80%' }}>

                                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
                                                onPress={() => acceptRequest(item)}>
                                                <Text>Accept</Text>
                                                <AntDesign name="check" style={{ marginHorizontal: 7 }}
                                                    size={44} color="green" />
                                            </TouchableOpacity>

                                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
                                                onPress={() => rejectRequest(item)}>
                                                <Text>Reject</Text>
                                                <Entypo name="cross" style={{ marginHorizontal: 7 }}
                                                    size={44} color="red" />
                                            </TouchableOpacity>

                                        </View>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                }
            </View>

        </View>
    )
}

export default FriendScreen;