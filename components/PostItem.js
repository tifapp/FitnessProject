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
  setUpdatePostID,
}) {  
  const navigation = useNavigation();
  const goToProfile = () => {
    navigation.navigate('Lookup',
      { userId: item.userId })
  }

  const displayTime = printTime(item.timestamp * 1000);

  //
  return (
    <View style={styles.secondaryContainerStyle}>
      <View style={styles.spaceAround}>
        <TouchableOpacity 
        onPress={goToProfile}
        style={{flexDirection: 'row'}}>
          <ProfileImageAndName
            style={styles.smallImageStyle}
            userId={item.userId}
          />
          <View>
            <Text>{displayTime}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.check}>{item.description}</Text>
      </View>

      {writtenByYou ? (
        <View style = {{ marginHorizontal: 30, flexDirection: 'row', justifyContent: 'space-evenly'}}>
          
          <TouchableOpacity style={[styles.unselectedButtonStyle, { borderColor: 'red' }]} color="red" onPress={() => (deletePostsAsync(item.timestamp))}>
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