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

export default function MutualFriends({
  item
}) {  
  const navigation = useNavigation();
  const goToProfile = () => {
    navigation.navigate('Lookup',
      { userId: item })
  }

  //
  return (
    <View style={styles.secondaryContainerStyle}>
      <View style={styles.spaceAround}>
        <TouchableOpacity 
        onPress={goToProfile}
        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <ProfileImageAndName
            style={styles.smallImageStyle}
            userId={item}
          />
        </TouchableOpacity>
      </View>

    </View>
  );
}