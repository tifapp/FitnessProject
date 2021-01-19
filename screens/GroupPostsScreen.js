import React, { useState, useEffect, PureComponent} from "react";
import {
  Text,
  View,
  TouchableOpacity
} from "react-native";
// Get the aws resources configuration parameters
import FeedScreen from "screens/FeedScreen";
import { Amplify } from "aws-amplify";
import { AntDesign } from '@expo/vector-icons';

//const { width } = Dimensions.get('window');

var styles = require('styles/stylesheet');

export default function GroupPostsScreen({ navigation, route }) {
  const { group } = route.params;
  //console.log(route.params);
  //console.log(route);
  const goEditGroupScreen = () => {
    navigation.navigate('Create Group', {group: group, check: true});
  }
  return (
    <View style={styles.containerStyle}>

      {route.params.id == group.userID ? 
      <TouchableOpacity onPress ={goEditGroupScreen}>
        <AntDesign style = {{alignSelf: "flex-end", marginTop: 10, marginRight: 15}} name="edit" size={30} color="black" />
      </TouchableOpacity> : 
      null}
      
      <View style={styles.header}>
        
        <Text style={styles.title}>{group.name}</Text>
        <Text style = {{alignSelf :'center'}}>"{group.Description}"</Text>
      </View>

      <FeedScreen
        navigation={navigation}
        route={route}
        channel={group.id}
      />
    </View>
  );
};