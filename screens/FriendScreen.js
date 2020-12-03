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
    const [friendRequestList, setFriendRequestList] = useState([]);

    const collectFriends = async () => {
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
        console.log("###########################");
        console.log(friendRequestList);
    }

    useEffect(() => {
        collectFriends();
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
                
                    <Text>Your awesome friends!</Text> 
                    
                    : 
                    <View>
                        <Text style = {{alignSelf: 'center'}}>Incoming Requests!</Text>
                        <FlatList
                            keyExtractor = {(item) => item.sender}
                            data={friendRequestList}
                            renderItem={({ item }) => (
                                <View style = {{marginVertical: 5}}>
                                    <View style = {{flexDirection: 'row'}}>
                                        <TouchableOpacity>
                                            <ProfileImageAndName
                                                style={styles.smallImageStyle}
                                                userId={item.sender}
                                            />
                                        </TouchableOpacity> 
                                        
                                        <TouchableOpacity style = {{alignSelf: 'center'}}>
                                            <AntDesign name="check" style = {{marginHorizontal: 7}} 
                                                size={44} color="green" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style = {{alignSelf: 'center'}}>
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