import React, {useState, useEffect} from 'react';
import {
    Alert,
    View,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
  } from "react-native";

import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { listFriendRequests, listFriendships, getFriendship, } from "root/src/graphql/queries";
import { createFriendRequest, deleteFriendRequest, deleteFriendship } from "root/src/graphql/mutations";
import { ProfileImageAndName } from 'components/ProfileImageAndName'

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
            await API.graphql(graphqlOperation(deleteFriendRequest, { input: { sender: item.sender, receiver: item.receiver}}));
        }
        catch(err){
            console.log("error: ", err);
        }
        // update friendRequestList
        collectFriendRequests();
    }

    const removeFriend = async (item) => {
        // delete friend object
        try {
            await API.graphql(graphqlOperation(deleteFriendship, { input: { user1: item.user1, user2: item.user2 }}));
        }
        catch(err){
            console.log("error: ", err);
        }
        // update friendList
        collectFriends();
    }

    const acceptRequest =  async (item) => {
        // accept friend request
        try {
            await API.graphql(graphqlOperation(createFriendRequest, { input: { receiver: item.sender }}));
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
        try{
            const matchresult = await API.graphql(
                graphqlOperation(listFriendships)
            );
            items = matchresult.data.listFriendships.items;
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
        try{
            const namematchresult = await API.graphql(
                graphqlOperation(listFriendRequests)
            );
            items = namematchresult.data.listFriendRequests.items;
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
                                <View style = {{flexDirection: 'row', marginVertical: 5}}>
                                    <TouchableOpacity onPress = {() => goToProfile(findFriendID(item))}>
                                        <ProfileImageAndName
                                            style={styles.smallImageStyle}
                                            userId={findFriendID(item)}
                                        />
                                    </TouchableOpacity>  
                                    <TouchableOpacity style = {{alignSelf: 'center'}} 
                                                      onPress = {() => removeFriendHandler(item)}>
                                        <Entypo name="cross" style = {{marginHorizontal: 7}}
                                                size={44} color="red" />
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