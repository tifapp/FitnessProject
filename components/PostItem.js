import React, { useState, useEffect } from "react";
import { Storage } from "aws-amplify";
import {
  StyleSheet,
  View,
  Button,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";
import { getUser } from "../src/graphql/queries";
import { ProfileImageAndName } from './ProfileImage'
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { useNavigation } from '@react-navigation/native';

var styles = require('../styles/stylesheet');

const months = [
  "January",
  "Febuary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function PostItem({
  item,
  pressHandler,
  deletePostsAsync,
  writtenByYou,
  setPostVal,
  setUpdatePostID,
}) {
  const [postAuthor, setPostAuthor] = useState({});

  const checkUsersName = async () => {
    try {
      const user = await API.graphql(
        graphqlOperation(getUser, { id: item.userId })
      );
      if (user.data.getUser != null) {
        //console.log("this post is...", item.description, "and the author is...", user.data.getUser);
        setPostAuthor(user.data.getUser);
      }

      //console.log("success, user is ", user);
    } catch (err) {
      console.log("error in finding user ", err);
    }
  };

  useEffect(() => {
    checkUsersName();
  }, []);

  const dateInfo = new Date(item.timestamp * 1000);
  var yearVal = dateInfo.getFullYear();
  var monthVal = dateInfo.getMonth();
  var dayVal = dateInfo.getDate();
  var hourVal = dateInfo.getHours();
  var minuteVal = dateInfo.getMinutes();
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
    //secondDifference = Math.floor(secondDifference);
    displayTime = "Just now";
  }
  else if (minuteDifference >= 1 && minuteDifference < 60) {
    minuteDifference = Math.floor(minuteDifference);
    if (minuteDifference == 1) {
      displayTime = minuteDifference + " minute ago";
    }
    else {
      displayTime = minuteDifference + " minutes ago";
    }
  }
  else if (hourDifference >= 1 && hourDifference < 24) {
    hourDifference = Math.floor(hourDifference);
    if (hourDifference == 1) {
      displayTime = hourDifference + " hour ago";
    }
    else {
      displayTime = hourDifference + " hours ago";
    }
  }
  else if (dayDifference >= 1 && dayDifference < 31) {
    dayDifference = Math.floor(dayDifference);
    if (dayDifference == 1) {
      displayTime = dayDifference + " day ago";
    }
    else {
      displayTime = dayDifference + " days ago";
    }
  }
  else if (monthDifference >= 1 && monthDifference < 12) {
    monthDifference = Math.floor(monthDifference);
    if (monthDifference == 1) {
      displayTime = monthDifference + " month ago";
    }
    else {
      displayTime = dayDifference + " months ago";
    }
  }
  else if (yearDifference >= 1) {
    yearDifference = Math.floor(yearDifference);
    if (yearDifference == 1) {
      displayTime = yearDifference + " year ago";
    }
    else {
      displayTime = yearDifference + " years ago";
    }
  }


  let timeCheck = "AM";

  if (hourVal >= 12 && hourVal <= 23) {
    timeCheck = "PM";
  }

  if (hourVal == 0) {
    hourVal = hourVal + 12;
  }

  if (hourVal > 12) {
    hourVal = hourVal - 12;
  }
  
  const navigation = useNavigation();
  const goToProfile = () => {
    navigation.navigate('Lookup',
      { userId: postAuthor.id })
  }

  //
  return (
    <View style={styles.secondaryContainerStyle}>
      <View style={styles.spaceAround}>
        <TouchableOpacity 
        onPress={goToProfile}
        style={{flexDirection: 'row'}}>
          <ProfileImageAndName
            style={styles.smallImageStyle}
            user={postAuthor}
          />
          <View>
            <Text>{displayTime} </Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.check}>{item.description}</Text>
      </View>

      {writtenByYou ? (
        <View style = {{ marginHorizontal: 30, flexDirection: 'row', justifyContent: 'space-evenly'}}>
          
          <TouchableOpacity style={[styles.unselectedButtonStyle, { borderColor: 'red' }]} color="red" onPress={() => (pressHandler(item.timestamp), deletePostsAsync(item.timestamp))}>
              <Text style={[styles.unselectedButtonTextStyle, {color: 'red'}]}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.unselectedButtonStyle, { borderColor: 'blue' }]} 
            color="blue" 
            onPress={() => (setPostVal(item.description), setUpdatePostID(item.timestamp))}>
            <Text style={[styles.unselectedButtonTextStyle, {color: 'blue'}]}>Edit</Text>
          </TouchableOpacity>
        </View>
        
      ) : null}
    </View>
  );
}