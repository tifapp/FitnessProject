import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { ProfileImage } from './ProfileImage'
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; 
import { computeDistance } from 'hooks/computeDistance';

var styles = require('../styles/stylesheet');

export default function UserListItem({
  item,
  distance
}) {
  const navigation = useNavigation();

  const goToProfile = () => {
    navigation.navigate('Lookup',
      { user: item })
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
        <Text>{item.name}</Text>
        <ProfileImage
          style={styles.smallImageStyle}
          user={item}
        />
        {
          distance > 0
          ? <Text>{distance} km.</Text>
          : <Text> </Text>
        }
      </View>
    </TouchableOpacity>
  );
}