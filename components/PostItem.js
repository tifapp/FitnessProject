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
import { ProfileImage } from './ProfileImage'
import { Amplify, API, graphqlOperation } from "aws-amplify";

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
}) {

  const [postAuthor, setPostAuthor] = useState('');

  const checkUsersName = async () => {
    try {
      const user = await API.graphql(
        graphqlOperation(getUser, { id: item.userId })
      );
      if (user.data.getUser != null) {
        setPostAuthor(user.data.getUser);
      }

      //console.log("success, user is ", user);
    } catch (err) {
      console.log("error: ", err);
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
  if (secondDifference > 1 && secondDifference < 60) {
    secondDifference = Math.floor(secondDifference);
    displayTime = secondDifference + " seconds ago";
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

  return (
    <View style={styles.secondaryContainerStyle}>
      <View style={styles.spaceAround}>
        <View style={{flexDirection: 'row'}}>
          <ProfileImage
            style={styles.smallImageStyle}
            user={postAuthor}
          />
          <View>
            <Text>{postAuthor.name}</Text>
            <Text>
              {displayTime}
            </Text>
          </View>
        </View>
        <Text style={styles.check}>{item.description}</Text>
      </View>

      {writtenByYou ? (
        <TouchableOpacity style={[styles.unselectedButtonStyle, { borderColor: 'red' }]} color="red" onPress={() => (pressHandler(item.id), deletePostsAsync(item.id))}>
          <Text style={[styles.unselectedButtonTextStyle, { color: 'red' }]}>Delete</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}