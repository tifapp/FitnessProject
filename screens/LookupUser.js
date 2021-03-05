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
import { onCreateFriendRequest, onCreateFriendship } from "root/src/graphql/subscriptions";
import APIList from "components/APIList"

var styles = require('styles/stylesheet');

const LookupUser = ({ route, navigation }) => {
  const [friendStatus, setFriendStatus] = useState("loading"); //can be either "received", "sent", "friends", or "none". don't misspell!
  const [friendsSince, setFriendsSince] = useState("");
  const [mutualfriendList, setMutualFriendList] = useState([]);
  
  const [hifiveSent, setHifiveSent] = useState(false); //can be either "received", "sent", or "none". don't misspell!
  const [hifives, setHifives] = useState(0);
  
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
    checkUsersInfo();
    checkFriendStatus();
  }, []);

  const collectMutualFriends = (items) => {
    //items is an array containing both user1 and user2's friendship objects
    //we must figure out where the duplicates are. by duplicates we mean userids that both users share.
    //why don't we just collect all the user id's that aren't user1 and user2 and pick out the duplicates?
    //maybe one iteration could work

    let ids = []
    let mutuals = []

    items.forEach(element => {
      if (element.user1 == route.params?.id || element.user1 == userId) {
        if (ids.includes(element.user2)) mutuals.push(element.user2);
        else ids.push(element.user2);
      } else if (element.user2 == route.params?.id || element.user2 == userId) {
        if (ids.includes(element.user1)) mutuals.push(element.user1);
        else ids.push(element.user1);
      }
    });

    return mutuals;
  }

  const checkFriendStatus = async () => {
    console.log("CHECKING FRIEND STATUS");
    try {
      let friendship = await API.graphql(
        graphqlOperation(getFriendship, {
          user1: route.params?.id < userId ? route.params?.id : userId,
          user2: route.params?.id < userId ? userId : route.params?.id,
        })
      );

      // If two people are friends
      if (friendship.data.getFriendship != null) {
        setFriendStatus("friends");
        setFriendsSince(printTime(friendship.data.getFriendship.createdAt));
        setHifives(friendship.data.getFriendship.hifives);
        console.log("check");
        console.log(friendship.data.getFriendship);
        //console.log(friendship.data.getFriendship.user2);
      } else {
        console.log("YOU ARE NOT FRIENDS");
        //console.log(friendship.data.getFriendship.user1);
        //console.log(friendship.data.getFriendship.user2);
        setFriendsSince("");

        const sentFriendRequest = await API.graphql(
          graphqlOperation(getFriendRequest, { sender: route.params?.id, receiver: userId })
        );
        // Outgoing request
        if (sentFriendRequest.data.getFriendRequest != null) { 
          setFriendStatus("sent");
        } else {
          const receivedFriendRequest = await API.graphql(
            graphqlOperation(getFriendRequest, { sender: userId, receiver: route.params?.id })
          );

          if (receivedFriendRequest.data.getFriendRequest != null) {
            setFriendStatus("received");
          } else {
            setFriendStatus("none");
          }
        }
      }
      waitForFriendUpdateAsync();
    } catch (err) {
      console.log(err);
    }
  };
  
  const waitForFriendUpdateAsync = async () => {
    await API.graphql(graphqlOperation(onCreateFriendship)).subscribe({
        next: event => {
            const newFriend = event.value.data.onCreateFriendship
            if ((newFriend.user1 == route.params?.id && newFriend.user2 == userId) || (newFriend.user2 == route.params?.id && newFriend.user1 == userId)) {
                setFriendStatus("friends");
        }
      }
    });
    await API.graphql(graphqlOperation(onCreateFriendRequest, { sender: userId, receiver: route.params?.id })).subscribe({
      next: event => {
        const newFriendRequest = event.value.data.onCreateFriendRequest
        console.log("received friend request: ", newFriendRequest)
        if (newFriendRequest.sender === userId && newFriendRequest.receiver === route.params?.id) {
          if (friendStatus == "sent") {
            setFriendStatus("friends");
          } else {
            setFriendStatus("received");
          }
        }
      }
    });
  }

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
    } catch (err) {
      console.log("Invalid");
      console.log(err);
    }
  };

  const sendFriendRequest = async () => {
    Alert.alert('Sending...', '', [], { cancelable: false })

    try {
      await API.graphql(graphqlOperation(createFriendRequest, { input: { receiver: user.id, } }));
      console.log("success");
      if (friendStatus == 'received') {
        setFriendStatus("friends")
      }
      else {
        setFriendStatus("sent"); //if received, should change to "friends". do a check before this
      }
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
          user1: route.params?.id < user.id ? route.params?.id : user.id,
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
          <View style={styles.border}>

            <View style={{ paddingBottom: 15 }}>
              <ProfileImageAndName
                you={userId === route.params?.id}
                navigation={false}
                vertical={true}
                imageStyle={styles.imageStyle}
                userId={userId}
                isFull={true}
                fullname={true}
              />
            </View>

            <View>
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

            {(mutualfriendList.length != 0) ?
              <View style={styles.viewProfileScreen}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>Mutual Friends </Text>
              </View>
              : null
            }

          </View>
          <View>
            <SafeAreaView style={{ flex: 1 }}>
              <APIList
                initialAmount={10}
                additionalAmount={20}
                horizontal={true}
                queryOperation={listFriendships}
                data={mutualfriendList}
                filter={{
                  filter: {
                    or: [{
                      user1: {
                        eq: route.params?.id
                      }
                    },
                    {
                      user2: {
                        eq: route.params?.id
                      }
                    },
                    {
                      user1: {
                        eq: userId
                      }
                    },
                    {
                      user2: {
                        eq: userId
                      }
                    },]
                  }
                }}
                setDataFunction={setMutualFriendList}
                processingFunction={collectMutualFriends}
                renderItem={({ item }) => (
                  <View style={{ marginVertical: 5 }}>
                    <View style={{ flexDirection: 'row', alignSelf: 'center', marginVertical: 5, justifyContent: 'space-between', width: '80%' }}>
                      <ProfileImageAndName
                        vertical={true}
                        imageStyle={[styles.smallImageStyle, {marginHorizontal: 20}]}
                        userId={item}
                      />
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item}
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
              {friendStatus == "loading" ?
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    padding: 10,
                  }} />
              : friendStatus == "none" ?
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