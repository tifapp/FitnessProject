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
import { ProfileImageAndName } from './ProfileImageAndName'
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { useNavigation } from '@react-navigation/native';
import printTime from 'hooks/printTime';

var styles = require('../styles/stylesheet');

export default function PostItem({
  item,
  deletePostsAsync,
  writtenByYou,
  setPostVal,
  setIsReplying,
  setUpdatePostID,
  parentID
}) {

  const displayTime = printTime(item.timestamp * 1000);
  //console.log(parentID);

  //
  return (
    <View style={styles.secondaryContainerStyle}>
      { parentID == "" || parentID == null ?
      <View style={styles.spaceAround}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ProfileImageAndName
            style={styles.smallImageStyle}
            userId={item.userId}
          />
          <View style={{ marginRight: 15 }}>
            <Text>{displayTime}</Text>
          </View>
        </View>
        <Text style={styles.check}>{item.description}</Text>
      </View> :

      <View style={styles.spaceAroundReply}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ProfileImageAndName
          style={styles.smallImageStyle}
          userId={item.userId}
        />
        <View style={{ marginRight: 15 }}>
          <Text>{displayTime}</Text>
        </View>
      </View>
      <Text style={styles.check}>{item.description}</Text>
      </View>
      }

      <View style={{ marginHorizontal: 30, flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {writtenByYou ? (
          <View style={{ marginHorizontal: 30, flexDirection: 'row', justifyContent: 'space-evenly' }}>
            <TouchableOpacity style={[styles.unselectedButtonStyle, { borderColor: 'red' }]} color="red" onPress={() => (deletePostsAsync(item.timestamp))}>
              <Text style={[styles.unselectedButtonTextStyle, { color: 'red' }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.unselectedButtonStyle, { borderColor: 'blue' }]}
              color="blue"
              onPress={() => (setPostVal(item.description), setUpdatePostID(item.timestamp))}>
              <Text style={[styles.unselectedButtonTextStyle, { color: 'blue' }]}>Edit</Text>
            </TouchableOpacity>

          </View>
        ) : null}
          {  parentID == "" || parentID == null ?
            <TouchableOpacity style={[styles.unselectedButtonStyle, { borderColor: 'orange' }]} color="orange" onPress={() => (setPostVal(""), setIsReplying(true), setUpdatePostID(item.timestamp.toString()))}>
              <Text style={[styles.unselectedButtonTextStyle, { color: 'orange' }]}>Reply</Text>
            </TouchableOpacity>
            : null
          }
      </View>
    </View>
  );
}