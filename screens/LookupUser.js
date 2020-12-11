import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Button, Image, Dimensions } from 'react-native';
import { API, graphqlOperation } from "aws-amplify";
import { StackActions, NavigationActions } from 'react-navigation';
import { ProfileImageAndName } from 'components/ProfileImageAndName'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import computeDistance from "hooks/computeDistance"
import getLocation from 'hooks/useLocation';
import printTime from 'hooks/printTime';
import { getFriendRequest, getUser } from "../src/graphql/queries";
import { createFriendRequest, deleteFriendRequest, getFriendship, deleteFriendship } from "root/src/graphql/mutations";
import { getFriend } from "root/src/graphql/queries";

var styles = require('styles/stylesheet');

const LookupUser = ({ route, navigation }) => {

  const [friendStatus, setFriendStatus] = useState("none"); //can be either "received", "sent", "friends", or "none". don't misspell!
  const [friendsSince, setFriendsSince] = useState("");

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
    } else {
      checkFriendStatus();
    }
  }, []);

  const checkFriendStatus = async () => {
    try {
      let friendship = await API.graphql(
        graphqlOperation(getFriendship, { sender: route.params?.id, receiver: user.id })
      );
      if (friendship.data.getFriendship == null) {
        friendship = await API.graphql(
          graphqlOperation(getFriendship, { sender: user.id, receiver: friendship.id })
        );
      }

      if (friendship.data.getFriendship != null) {
        setFriendStatus("friends");
        setFriendsSince(printTime(friendship.data.getFriendship.timestamp * 1000));
      } else {
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

  const sendFriendRequest = async () => {
    Alert.alert('Submitting Friend Request...', '', [], { cancelable: false })
 
    try {
      await API.graphql(graphqlOperation(createFriendRequest, { input: { sender: route.params?.id, receiver: user.id, } }));
      console.log("success");
      setFriendStatus("sent"); //if received, should change to "friends"
      alert('Friend request submitted successfully!');
    } catch (err) {
      console.log(err);
      alert('Friend request could not be submitted! ');
    }
  };

  const unsendFriendRequest = async () => {
    Alert.alert('Unsending Friend Request...', '', [], { cancelable: false })

    try {
      await API.graphql(graphqlOperation(deleteFriendRequest, { input: { sender: route.params?.id, receiver: user.id } }));
      console.log("success");
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
    } catch (err) {
      console.log(err);
      console.log("error in deleting post: ");
    }
  };
  
  const deleteFriend = async () => {
    Alert.alert('Deleting Friend...', '', [], { cancelable: false })

    try {
      await API.graphql(graphqlOperation(deleteFriendship, { input: { sender: user.id, receiver: route.params?.id } }));
      console.log("success");
    } catch (err) {
      console.log(err);
      console.log("error in deleting post: ");
    }
    try {
      await API.graphql(graphqlOperation(deleteFriendship, { input: { sender: route.params?.id, receiver: user.id } }));
      console.log("success");
    } catch (err) {
      console.log(err);
      console.log("error in deleting post: ");
    }
  };

  return (
    user == null ? null :
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
        {
          getLocation() != null && user.latitude != null
            ?
            <View style={styles.viewProfileScreen}>
              <Text style={styles.viewProfileScreen}>{computeDistance([user.latitude, user.longitude])} mi. away</Text>
            </View>
            : null
        }
        {friendsSince != "" ?
          <View style={styles.viewProfileScreen}>
            <Text>Friends for {friendsSince} </Text>
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
              <TouchableOpacity
                onPress={deleteFriend}
                style={styles.unsendButton}
              >
                <Text style={styles.buttonTextStyle}>Delete Friend</Text>
              </TouchableOpacity>
            }
          </View>
          : null
        }
      </ScrollView>
  )
}

export default LookupUser;