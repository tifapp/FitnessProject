import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { ProfileImageAndName } from './ProfileImage'
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; 
import computeDistance from "hooks/computeDistance"

var styles = require('../styles/stylesheet');

export default function UserListItem({
  item,
  location
}) {
  const navigation = useNavigation();

  const goToProfile = () => {
    navigation.navigate('Lookup',
      { user: item, location: location })
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
        <AntDesign name="user" size={24} color="black" />
        <ProfileImageAndName
          style={styles.smallImageStyle}
          user={item}
        />
        {
          location != null && item.latitude != null
          ? <Text>{computeDistance([location.latitude, location.longitude], [item.latitude, item.longitude])} mi.</Text>
          : null
        }
      </View>
    </TouchableOpacity>
  );
}