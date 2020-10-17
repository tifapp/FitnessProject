import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { ProfileImage } from './ProfileImage'
import { useNavigation } from '@react-navigation/native';

var styles = require('../styles/stylesheet');

export default function UserListItem({
  item
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
        <Text>{item.name}</Text>
        <ProfileImage
          style={styles.smallImageStyle}
          user={item}
        />
      </View>
    </TouchableOpacity>
  );
}