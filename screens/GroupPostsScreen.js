import React, { useState, useEffect, PureComponent } from "react";
import {
  Text,
  View,
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import FeedScreen from "screens/FeedScreen";
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);

//const { width } = Dimensions.get('window');

var styles = require('styles/stylesheet');

export default function GroupPostsScreen({ navigation, route }) {
  const { group } = route.params;

  //console.log(userId);
  //console.log(group);

  return (
    <View style={styles.containerStyle}>
      <View style={styles.header}>
        <Text style={styles.title}>{group.name}</Text>
      </View>

      <FeedScreen
        initialParams={route.params}
      />
    </View>
  );
};