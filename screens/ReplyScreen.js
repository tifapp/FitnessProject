import React, { useState, useEffect, PureComponent } from "react";
import {
  Text,
  View,
  TouchableOpacity
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import FeedScreen from "screens/FeedScreen";
import PostItem from "components/PostItem";
import { Amplify } from "aws-amplify";
import { AntDesign } from '@expo/vector-icons';

Amplify.configure(awsconfig);

var styles = require('styles/stylesheet');

export default function ReplyScreen({ navigation, route }) {

  const { op } = route.params;

  return (
    <View style={styles.containerStyle}>
      <PostItem
        item={item}
        deletePostsAsync={deletePostsAsync}
        writtenByYou={item.userId === route.params?.id}
        setPostVal={setPostVal}
        setUpdatePostID={setUpdatePostID}
      />

      <FeedScreen
        navigation={navigation}
        route={route}
        initialParams={route.params}
      />
    </View>
  );
};