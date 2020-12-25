import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { ProfileImageAndName } from './ProfileImageAndName';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; 
import computeDistance from "hooks/computeDistance";
import getLocation from 'hooks/useLocation';

var styles = require('../styles/stylesheet');

export default function UserListItem({
  item,
  matchingname
}) {
  const navigation = useNavigation();

  const goToProfile = () => {
    navigation.navigate('Lookup',
      { user: item, })
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
        <AntDesign name="user" size={24} color={matchingname ? "black" : "orange"} />
        <ProfileImageAndName
          style={styles.smallImageStyle}
          userId={item.id}
        />
        {
          getLocation() != null && item.latitude != null
          ? <Text>{computeDistance([item.latitude, item.longitude])} mi.</Text>
          : null
        }
      </View>
    </TouchableOpacity>
  );
}