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

  var yearVal = new Date(item.date).getFullYear();
  var monthVal = new Date(item.date).getMonth();
  var dayVal = new Date(item.date).getDate();
  var hourVal = new Date(item.date).getHours();
  var minuteVal = new Date(item.date).getMinutes();
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
          {months[monthVal]}-{dayVal}-{yearVal} {hourVal}:{minuteVal}{" "}
          {timeCheck}
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