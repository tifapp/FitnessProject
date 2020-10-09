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

var styles = require('../styles/stylesheet');

export default function UserListItem({
  nameVal, genderVal, goalsVal, ageVal, pictureURL, bioVal, navigation
}) {
  const [imageURL, setImageURL] = useState('');
{
  Storage.get('profileimage.jpg', { level: 'protected', identityId: pictureURL }) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
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
    <View>
        <View style={styles.secondaryContainerStyle}>
          <View style={[{
        flexBasis: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginHorizontal: 25,
      }, styles.check]}>
          <TouchableOpacity onPress={() => navigation.navigate('Lookup', 
          {name: nameVal, gender: genderVal, goals: goalsVal, age: ageVal, picture: pictureURL, bio: bioVal})}>
            <Text>{nameVal}</Text> 
            
             
            <Image
              style={styles.smallImageStyle}
              source={imageURL === '' ? require('../assets/icon.png') :{uri: imageURL}}
            />
            
            
            </TouchableOpacity>
          </View>
        </View>
    </View>
  );
}