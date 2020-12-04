import React, {useState, useEffect} from 'react';
import {
    StyleSheet,
    View,
    Button,
    FlatList,
    Image,
    RefreshControl,
    TextInput,
    Text,
    TouchableOpacity,
  } from "react-native";

import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { updateFriend, deleteFriend } from "root/src/graphql/mutations";
import { listFriends } from "root/src/graphql/queries";
import { ProfileImageAndName } from '../components/ProfileImage'

import { AntDesign } from '@expo/vector-icons'; 
import { Entypo } from '@expo/vector-icons'; 

Amplify.configure(awsconfig);

var styles = require('styles/stylesheet');

const FriendScreen = ({route, navigation }) => {
    const [friendsEnabled, setFriendsEnabled] = useState(true);
    const [friendList, setFriendList] = useState([]);
    const [friendRequestList, setFriendRequestList] = useState([]);
    
    const goToProfile = (id) => {
        navigation.navigate('Lookup',
        { userId: id })
    }

    const findFriendID = (item) => {
        if (route.params?.id == item.receiver) return item.sender;
        if (route.params?.id == item.sender) return item.receiver;
    }

    const rejectRequest = async (item) => {
        // delete friend object
        try {
            await API.graphql(graphqlOperation(deleteFriend, { input: { sender: item.sender, receiver: item.receiver}}));
        }
        catch(err){
            console.log("error: ", err);
        }
        // update friendRequestList
        collectFriendRequests();
    }

    const acceptRequest =  async (item) => {
        // accept friend request
        try {
            await API.graphql(graphqlOperation(updateFriend, { input: { sender: item.sender, receiver: item.receiver, accepted: true}}));
        }
        catch(err){
            console.log("error: ", err);
        }

        // update friendRequestList and friendList
        collectFriendRequests();
        collectFriends();
    }

    const displayFriendsAndRequests = () => {
        collectFriends();
        collectFriendRequests();
    }

    const collectFriends = async() => {
        let items = [];
        // Not sure if I set up the friend filter correctly.
        // Will come back to it when I figure out accept/rejecting requests
        let friendFilter = {
            and: {
                or: [
                    { receiver: {eq : route.params?.id} },
                    { sender: {eq : route.params?.id} },
                ],
                and: { accepted: {eq : true} }
            }
        };
        try{
            const namematchresult = await API.graphql(
                graphqlOperation(listFriends, {
                    filter: friendFilter
                })
            );
            items = namematchresult.data.listFriends.items;
            setFriendList(items);
        }
        catch(err){
            console.log("error: ", err);
        }
        console.log("#########-Friends-###########");
        console.log(friendList);

    }
    const collectFriendRequests = async () => {
        let items = [];
        let requestFilter = {
            and: [
                { receiver: {eq : route.params?.id} },
                { accepted: {eq : false} }
            ]
        };
        try{
            const namematchresult = await API.graphql(
                graphqlOperation(listFriends, {
                    filter: requestFilter
                })
            );
            items = namematchresult.data.listFriends.items;
            setFriendRequestList(items);
        }
        catch(err){
            console.log("error: ", err);
        }
        console.log("#########-Friend Requests-###########");
        console.log(friendRequestList);
    }

    useEffect(() => {
        displayFriendsAndRequests();
    }, []);

    return (
        <View>
            <View style = {{flexDirection: 'row', justifyContent: 'center', marginTop: 25}}>
                <TouchableOpacity 
                    style = { (friendsEnabled) ? styles.outlineButtonStyle : styles.unselectedButtonStyle}
                    onPress = {() => setFriendsEnabled(true)}> 
                    <Text style = {(friendsEnabled) ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>Friends</Text>  
                </TouchableOpacity>
                <TouchableOpacity 
                    style = { (friendsEnabled) ? styles.unselectedButtonStyle : styles.outlineButtonStyle}
                    onPress = {() => setFriendsEnabled(false)}>
                    <Text style = {(friendsEnabled) ? styles.unselectedButtonTextStyle : styles.outlineButtonTextStyle}>Requests</Text>  
                </TouchableOpacity>
                
            </View>
            <View style = {{marginTop: 25, alignSelf: 'center'}}>
                {friendsEnabled ? 
                    
                    <View>
                        <Text style = {{alignSelf: 'center'}}>Your awesome friends!</Text> 
                        <FlatList
                            keyExtractor = {(item) => item.timestamp}
                            data={friendList}
                            renderItem={({ item }) => (
                                <View style = {{marginVertical: 5}}>
                                    <TouchableOpacity onPress = {() => goToProfile(findFriendID(item))}>
                                        <ProfileImageAndName
                                            style={styles.smallImageStyle}
                                            userId={findFriendID(item)}
                                        />
                                    </TouchableOpacity>                         
                                </View>
                            )}
                        />
                    </View>
                    
                    : 

                    <View>
                        <Text style = {{alignSelf: 'center'}}>Incoming Requests!</Text>
                        <FlatList
                            keyExtractor = {(item) => item.sender}
                            data={friendRequestList}
                            renderItem={({ item }) => (
                                <View style = {{marginVertical: 5}}>
                                    <View style = {{flexDirection: 'row'}}>
                                        <TouchableOpacity onPress = {() => goToProfile(item.sender)}>
                                            <ProfileImageAndName
                                                style={styles.smallImageStyle}
                                                userId={item.sender}
                                            />
                                        </TouchableOpacity> 
                                        
                                        <TouchableOpacity style = {{alignSelf: 'center'}}
                                                          onPress = {() => acceptRequest(item)}>
                                            <AntDesign name="check" style = {{marginHorizontal: 7}} 
                                                size={44} color="green" />
                                        </TouchableOpacity>

                                        <TouchableOpacity style = {{alignSelf: 'center'}} 
                                                          onPress = {() => rejectRequest(item)}>
                                            <Entypo name="cross" style = {{marginHorizontal: 7}}
                                                size={44} color="red" />
                                        </TouchableOpacity>
                                        
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