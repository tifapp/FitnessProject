import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Button,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";

var styles = require('../styles/stylesheet');

export default function PostItem({
  item,
  pressHandler,
  deletePostsAsync,
  emailVal,
}) {
  const val = emailVal === item.email;
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

  const dateInfo = new Date(item.timestamp * 1000);
  
  var yearVal = dateInfo.getFullYear();
  var monthVal = dateInfo.getMonth();
  var dayVal = dateInfo.getDate();
  var hourVal = dateInfo.getHours();
  var minuteVal = dateInfo.getMinutes();
  var totalTime = dateInfo.getTime();

  var currentTotalTime = new Date().getTime();

  var timeDifference = currentTotalTime-totalTime;
  var secondDifference = timeDifference/1000;
  var minuteDifference = secondDifference/60;
  var hourDifference = minuteDifference/60;
  var dayDifference = hourDifference/24;
  var monthDifference = dayDifference/30;
  var yearDifference = monthDifference/12;

  let displayTime = "";
  if(secondDifference>1 && secondDifference<60){
    secondDifference = Math.floor(secondDifference);
    displayTime = "Last Posted: " + secondDifference + " seconds ago";
  }
  else if(minuteDifference>=1 && minuteDifference<60){
    minuteDifference = Math.floor(minuteDifference);
    if(minuteDifference==1){
      displayTime = " Last Posted: " + minuteDifference + " minute ago";
    }
    else{
      displayTime = " Last Posted: " + minuteDifference + " minutes ago";
    }
  }
  else if(hourDifference>=1 && hourDifference<24){
    hourDifference = Math.floor(hourDifference);
    if(hourDifference==1){
      displayTime = " Last Posted: " + hourDifference + " hour ago";
    }
    else{
      displayTime = " Last Posted: " + hourDifference + " hours ago";
    }
  }
  else if(dayDifference>=1 && dayDifference<31){
    dayDifference = Math.floor(dayDifference);
    if(dayDifference==1){
      displayTime = " Last Posted: " + dayDifference + " day ago";
    }
    else{
      displayTime = " Last Posted: " + dayDifference + " days ago";
    }
  }
  else if(monthDifference>=1 && monthDifference<12){
    monthDifference = Math.floor(monthDifference);
    if(monthDifference==1){
      displayTime = " Last Posted: " + monthDifference + " month ago";
    }
    else{
      displayTime = " Last Posted: " + dayDifference + " months ago";
    }
  }
  else if(yearDifference>=1){
    yearDifference = Math.floor(yearDifference);
    if(yearDifference==1){
      displayTime = " Last Posted: " + yearDifference + " year ago";
    }
    else{
      displayTime = " Last Posted: " + yearDifference + " years ago";
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
        <Text>{item.email}</Text>
        <Text>
          {displayTime}
        </Text>
        <Text style={styles.check}>{item.name}</Text>
      </View>

      {val ? (
        <TouchableOpacity style={[styles.unselectedButtonStyle, {borderColor: 'red'}]} color="red" onPress={() => (pressHandler(item.id), deletePostsAsync(item.id))}>
            <Text style={[styles.unselectedButtonTextStyle, {color: 'red'}]}>Delete</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}