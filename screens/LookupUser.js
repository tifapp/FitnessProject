import React, { useState, useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Button, Image, Dimensions, FlatList } from 'react-native';
import { API, graphqlOperation } from "aws-amplify";
import { StackActions, NavigationActions } from 'react-navigation';
import { ProfileImageAndName } from 'components/ProfileImageAndName'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import computeDistance from "hooks/computeDistance"
import getLocation from 'hooks/useLocation';
import printTime from 'hooks/printTime';
import { getUser, getFriendRequest, getFriendship, listFriendships, friendsBySecondUser } from "../src/graphql/queries";
import { createFriendRequest, deleteFriendRequest, deleteFriendship } from "root/src/graphql/mutations";
import MutualFriends from "components/MutualFriendsList";

var styles = require('styles/stylesheet');


const LookupUser = ({ route, navigation }) => {

  const goToProfile = (item) => {
    console.log("check");
    navigation.push('Lookup',
      { userId: item})
  }

  const [friendStatus, setFriendStatus] = useState("none"); //can be either "received", "sent", "friends", or "none". don't misspell!
  const [hifiveSent, setHifiveSent] = useState(false); //can be either "received", "sent", or "none". don't misspell!
  const [friendsSince, setFriendsSince] = useState("");
  const [hifives, setHifives] = useState(0);
  const [mutualfriendList, setMutualFriendList] = useState([]);

  const { user } = route.params;
  const { userId } = route.params;
  const { id } = route.params;

  const checkUsersInfo = async () => {
    try {
      console.log("on the lookup screen, id is: ", userId);
      const u = await API.graphql(
        graphqlOperation(getUser, { id: userId })
      );
      console.log(u.data.getUser);
      if (u.data.getUser != null) {
        //console.log("this post is...", item.description, "and the author is...", user.data.getUser);
        navigation.setParams({ user: u.data.getUser })
      }

      //console.log("success, user is ", user);
    } catch (err) {
      console.log("error in finding user ", err);
    }
  };


  useEffect(() => {
    if (user == null) {
      checkUsersInfo();
    }
  }, []);
  
  useEffect(() => {
    checkFriendStatus();
    collectMutualFriends();
  }, []);




  const collectMutualFriends = async () => {
    let user1_items = [];
    let user2_items = [];
    let total_items = [];

    console.log("Collecting Friends");

    try{
        const match_result_1 = await API.graphql(
            graphqlOperation(listFriendships, {user1: user.id})
        );
        
        user1_items = match_result_1.data.listFriendships.items;
        

        const match_result_2 = await API.graphql(
          graphqlOperation(friendsBySecondUser, {user2: route.params?.id})
        );

        user2_items = match_result_2.data.friendsBySecondUser.items;
        console.log("User 1's Friends!")
        console.log(user1_items);
        console.log("User 2's Friends!")
        console.log(user2_items);

        user1_items = user1_items.map((x) => x.user2);
        user2_items = user2_items.map((x) => x.user1);

        console.log(user1_items);
        console.log("******************************************")
        console.log(user2_items);

        total_items = user1_items.filter((x) => (user2_items.includes(x)));
        console.log("-----------------------------");
        console.log(total_items);

        setMutualFriendList(total_items);

        //setFriendRequestList(items);
        //setRefreshing(false);
    }
    catch(err){
        console.log("error: ", err);
    }
}

  const checkFriendStatus = async () => {
    console.log("CHECKING FRIEND STATUS");
    try {
      let friendship = await API.graphql(
        graphqlOperation(getFriendship, { 
          user1: route.params?.id < user.id ? route.params?.id : user.id, 
          user2: route.params?.id < user.id ? user.id : route.params?.id, 
        })
      );

      if (friendship.data.getFriendship != null) {
        setFriendStatus("friends");
        setFriendsSince(printTime(friendship.data.getFriendship.timestamp * 1000));
        setHifives(friendship.data.getFriendship.hifives);
        console.log("check");
        console.log(friendship.data.getFriendship);
        //console.log(friendship.data.getFriendship.user2);

      } else {
        console.log("YOU ARE NOT FRIENDS");
        console.log(friendship.data.getFriendship.user1);
        console.log(friendship.data.getFriendship.user2);
        setFriendsSince("");

        const sentFriendRequest = await API.graphql(
          graphqlOperation(getFriendRequest, { sender: route.params?.id, receiver: user.id })
        );

        if (sentFriendRequest.data.getFriendRequest != null) {
          setFriendStatus("sent");
        } else {
          const receivedFriendRequest = await API.graphql(
            graphqlOperation(getFriendRequest, { sender: user.id, receiver: route.params?.id })
          );

          if (receivedFriendRequest.data.getFriendRequest != null) {
            setFriendStatus("received");
          } else {
            setFriendStatus("none");
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const checkMutualFriendStatus = async () => {
    console.log("CHECKING MUTUAL FRIEND STATUS");
    try {
      let friendship = await API.graphql(
        graphqlOperation(listFriendships, { 
          user1: route.params?.id < user.id ? route.params?.id : user.id, 
          user2: route.params?.id < user.id ? user.id : route.params?.id, 
        })
      );

      if (friendship.data.listFriendships != null) {
        console.log(friendship.data.listFriendships);

      } else {
        console.log("YOU ARE NOT MUTUAL FRIENDS");
        console.log(friendship.data.getFriendship.user1);
        console.log(friendship.data.getFriendship.user2);
        setFriendsSince("");
      }
    }catch (err) {
      console.log("Invalid");
      console.log(err);
    }
  };

  const sendFriendRequest = async () => {
    Alert.alert('Sending...', '', [], { cancelable: false })
 
    try {
      await API.graphql(graphqlOperation(createFriendRequest, { input: { receiver: user.id, } }));
      console.log("success");
      setFriendStatus("sent"); //if received, should change to "friends". do a check before this
      alert('Sent successfully!');
    } catch (err) {
      console.log(err);
      alert('Could not be submitted!');
    }
  };

  const unsendFriendRequest = async () => {
    Alert.alert('Unsending Friend Request...', '', [], { cancelable: false })

    try {
      await API.graphql(graphqlOperation(deleteFriendRequest, { input: { sender: route.params?.id, receiver: user.id } }));
      console.log("success");      
      setFriendStatus("none");
      alert('Friend request unsent successfully!');
    } catch (err) {
      console.log(err);
      console.log("error in deleting post: ");
    }
  };
  
  const rejectFriendRequest = async () => {
    Alert.alert('Rejecting Friend Request...', '', [], { cancelable: false })

    try {
      await API.graphql(graphqlOperation(deleteFriendRequest, { input: { sender: user.id, receiver: route.params?.id } }));
      console.log("success");
      setFriendStatus("none");
      alert('Friend request rejected successfully!');
    } catch (err) {
      console.log(err);
      console.log("error in deleting post: ");
    }
  };
  
  const deleteFriend = async () => {
    Alert.alert('Deleting Friend...', '', [], { cancelable: false })

    try {
      await API.graphql(graphqlOperation(deleteFriendship, { 
        input: { 
          user1: route.params?.id < user.id ? route.params?.id : user.id ,
          user2: route.params?.id < user.id ? user.id : route.params?.id,
        } 
      }));
      console.log("success");
      setFriendStatus("none");
      alert('Friend removed from friends list successfully!');
    } catch (err) {
      console.log(err);
      console.log("error in deleting post: ");
    }
  };

  return (
    user == null ? null :
    <View>
      <ScrollView>
        {
          user.id == id
            ? <TouchableOpacity
              style={{ position: 'absolute', top: 25, right: 25, borderWidth: 1, borderRadius: 25, padding: 10 }}
              onPress={() => navigation.navigate('Profile', {
                screen: 'Profile',
                params: { fromLookup: true },
              })}>
              <MaterialCommunityIcons style={styles.editIconStyle} name="dumbbell" size={24} color="black" />
            </TouchableOpacity>
            : null
        }
        <View style={styles.border}>
          {/*
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                    <Text style={styles.buttonTextStyle}>Go Back</Text>
                </TouchableOpacity>
                 */}

          <View style={{ paddingBottom: 15 }}>

            <ProfileImageAndName
              style={styles.imageStyle}
              userId={user.id}
              isFull={true}
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
        <View>

        { (mutualfriendList.length != 0) ?
        <View style={styles.viewProfileScreen}>
          <Text>Mutual Friends: </Text>
        </View>
        : null
        }

        </View>
        <View>
        <SafeAreaView style={{flex: 1}}>
            <FlatList
            data={mutualfriendList}
            //keyExtractor = {(item) => item.toString()}
            keyExtractor = {(item, index) => item}
            renderItem={({ item }) => (
              <View style = {{marginVertical: 5}}>
                  <View style = {{flexDirection: 'row', alignSelf: 'center', marginVertical: 5, justifyContent: 'space-between', width: '80%'}}>
                      <TouchableOpacity onPress = {() => goToProfile(item)}>
                          <ProfileImageAndName
                              style={styles.smallImageStyle}
                              userId={item}
                          />
                      </TouchableOpacity>
                  </View> 
              </View>
            )}
          />
          </SafeAreaView>
        </View>
        {
          getLocation() != null && user.latitude != null
            ?
            <View style={styles.viewProfileScreen}>
              <Text style={styles.viewProfileScreen}>{computeDistance([user.latitude, user.longitude])} mi. away</Text>
            </View>
            : null
        }
        {route.params?.id != user.id ?
          <View style={styles.buttonFormat}>
            {friendStatus == "none" ?
              <TouchableOpacity
                onPress={sendFriendRequest}
                style={styles.submitButton}
              >
                <Text style={styles.buttonTextStyle}>Send Friend Request</Text>
              </TouchableOpacity>
              : friendStatus == "sent" ?
              <TouchableOpacity
                onPress={unsendFriendRequest}
                style={styles.unsendButton}
              >
                <Text style={styles.buttonTextStyle}>Unsend Friend Request</Text>
              </TouchableOpacity>
              : friendStatus == "received" ?
              <View>
                <TouchableOpacity
                  onPress={rejectFriendRequest}
                  style={styles.unsendButton}
                >
                  <Text style={styles.buttonTextStyle}>Reject Friend Request</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={sendFriendRequest}
                  style={styles.unsendButton}
                >
                  <Text style={styles.buttonTextStyle}>Accept Friend Request</Text>
                </TouchableOpacity>
              </View>
              : 
              <View>
                <View style={styles.viewProfileScreen}>
                  <Text>Friends for {friendsSince} </Text>
                </View>
                <TouchableOpacity
                  onPress={deleteFriend}
                  style={styles.unsendButton}
                >
                  <Text style={styles.buttonTextStyle}>Delete Friend</Text>
                </TouchableOpacity>
              </View>
            }
          </View>
          : null
        }
      </ScrollView>
      </View>
  )
}

export default LookupUser;