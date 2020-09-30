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

  return (
    <View style={styles.secondaryContainerStyle}>
      <View style={styles.spaceAround}>
        <Text>{item.email}</Text>
        <Text>
          {months[item.month]}-{item.day}-{item.year} {item.hour}:{item.minute}{" "}
          {item.timeOfDay}
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