import React, { useState } from "react";
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

import { useNavigation } from '@react-navigation/native';

var styles = require('../styles/stylesheet');

export default function UserListItem({
  item
}) {
  const navigation = useNavigation();

  const goToProfile = () => {
    navigation.navigate('Lookup', 
          {user: item, picture: imageURL})
  }

  const [imageURL, setImageURL] = useState('');
{
  Storage.get('profileimage.jpg', { level: 'protected', identityId: item.pictureURL }) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
    .then((imageURL) => { //console.log("found profile image!", imageURL); 
      Image.getSize(imageURL, () => {
        setImageURL(imageURL);
      }, err => {
        setImageURL('')
      });
    })
    .catch((err) => { console.log("could not find image!", err) }) //should just use a "profilepic" component
  }

  return (
    <TouchableOpacity
      style={[styles.secondaryContainerStyle]}
      onPress={goToProfile}>
      <View style={[{
        flexBasis: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginHorizontal: 25,
      }, styles.check]}>
        <Text>{item.name}</Text>
        <Image
          style={styles.smallImageStyle}
          source={imageURL === '' ? require('../assets/icon.png') : { uri: imageURL }}
        />
      </View>
    </TouchableOpacity>
  );
}