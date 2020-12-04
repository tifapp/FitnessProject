import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Button, Image, Dimensions } from 'react-native';
import { API, graphqlOperation } from "aws-amplify";
import { StackActions, NavigationActions } from 'react-navigation';
import { ProfileImageAndName } from 'components/ProfileImage'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import computeDistance from "hooks/computeDistance"
import * as Location from 'expo-location';
import { getUser } from "../src/graphql/queries";
import { createPost, updatePost, deletePost, createFriend, deleteFriend } from "root/src/graphql/mutations";
import { getFriend } from "root/src/graphql/queries";

var styles = require('styles/stylesheet');

const LookupUser = ({ route, navigation }) => {

  const [friendRequest, setFriendRequest] = useState(true);
  const [friendsSince, setFriendsSince] = useState("");
  //const [isFriend, setIsFriend] = useState(true);

  const { user } = route.params;
  const { userId } = route.params;
  const { id } = route.params;
  const { location } = route.params;


 const FriendsInfo = async (friendsFrom) => {
  const dateInfo = new Date(friendsFrom * 1000);

  var hourVal = dateInfo.getHours();
  var totalTime = dateInfo.getTime();

  var currentTotalTime = new Date().getTime();

  var timeDifference = currentTotalTime - totalTime;

  var secondDifference = timeDifference / 1000;
  var minuteDifference = secondDifference / 60;
  var hourDifference = minuteDifference / 60;
  var dayDifference = hourDifference / 24;
  var monthDifference = dayDifference / 30;
  var yearDifference = monthDifference / 12;

  let displayTime = "";
  if (secondDifference < 60) {
    displayTime = "Just recently";
  }
  else if (minuteDifference >= 1 && minuteDifference < 60) {
    minuteDifference = Math.floor(minuteDifference);
    if (minuteDifference == 1) {
      displayTime = minuteDifference + " minute";
    }
    else {
      displayTime = minuteDifference + " minutes";
    }
  }
  else if (hourDifference >= 1 && hourDifference < 24) {
    hourDifference = Math.floor(hourDifference);
    if (hourDifference == 1) {
      displayTime = hourDifference + " hour";
    }
    else {
      displayTime = hourDifference + " hours";
    }
  }
  else if (dayDifference >= 1 && dayDifference < 31) {
    dayDifference = Math.floor(dayDifference);
    if (dayDifference == 1) {
      displayTime = dayDifference + " day";
    }
    else {
      displayTime = dayDifference + " days";
    }
  }
  else if (monthDifference >= 1 && monthDifference < 12) {
    monthDifference = Math.floor(monthDifference);
    if (monthDifference == 1) {
      displayTime = monthDifference + " month";
    }
    else {
      displayTime = dayDifference + " months";
    }
  }
  else if (yearDifference >= 1) {
    yearDifference = Math.floor(yearDifference);
    if (yearDifference == 1) {
      displayTime = yearDifference + " year";
    }
    else {
      displayTime = yearDifference + " years";
    }
  }

  setFriendsSince(displayTime);
}



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
      checkFriendRequest();
    }
  }, []);

  useEffect(() => {
    if (location == null) {
      (async () => {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
        }

        let loc = await Location.getCurrentPositionAsync({ accuracy: 2 });

        navigation.setParams({ location: { latitude: loc.coords.latitude, longitude: loc.coords.longitude } })
      })();
    }
  }, []);

  const checkFriendRequest = async () => {
    try {
      const friend = await API.graphql(
        graphqlOperation(getFriend, { sender: route.params?.id, receiver: user.id })
      );

      setFriendsSince("");

      if(friend.data.getFriend!=null && friend.data.getFriend.accepted==true){
        FriendsInfo(friend.data.getFriend.timestamp);
        setFriendRequest(false);
      }
      else if(friend.data.getFriend!=null && friend.data.getFriend.accepted==false){
        setFriendRequest(false);
      }
      else{
        setFriendRequest(true);
      }


    } catch (err) {
      console.log(err);
    }
  };

  const addFriend = async () => {
    Alert.alert('Submitting Friend Request...', '', [], { cancelable: false })

    const newFriend = {
      timestamp: Math.floor(Date.now() / 1000),
      sender: route.params?.id,
      receiver: user.id,
      accepted: false //whoops
    };
    setFriendRequest(false);

    try {
      await API.graphql(graphqlOperation(createFriend, { input: newFriend }));
      console.log("success");
      alert('Friend request submitted successfully!');
    } catch (err) {
      console.log(err);
      alert('Friend request could not be submitted! ');
    }
  };

  const deleteFriendRequest = async () => {
    Alert.alert('Deleting Friend Request...', '', [], { cancelable: false })
    console.log("hello");
    setFriendRequest(true);
    try {
      await API.graphql(graphqlOperation(deleteFriend, { input: { sender: route.params?.id, receiver: user.id } }));
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
          <Text>Friends For: {friendsSince} </Text>
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
            ?
            <View style={styles.viewProfileScreen}>
              <Text style={styles.viewProfileScreen}>{computeDistance([location.latitude, location.longitude], [user.latitude, user.longitude])} mi. away</Text>
            </View>
            : null
        }
        <View style={styles.buttonFormat}>
          {friendRequest ?
            <TouchableOpacity
              onPress={() => {
                addFriend(), checkFriendRequest()
              }}
              style={styles.submitButton}
            >
              <Text style={styles.buttonTextStyle}>Send Friend Request</Text>
            </TouchableOpacity>
            :
            <TouchableOpacity
              onPress={() => {
                deleteFriendRequest(), checkFriendRequest()
              }}
              style={styles.unsendButton}
            >
              <Text style={styles.buttonTextStyle}>Unsend Friend Request</Text>
            </TouchableOpacity>
          }
        </View>
      </ScrollView>
  )
}

export default LookupUser;