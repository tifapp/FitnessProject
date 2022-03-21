import PostItem from "components/PostItem";
import React from "react";
import { View } from "react-native";
// Get the aws resources configuration parameters
import FeedScreen from "screens/FeedScreen";

var styles = require("styles/stylesheet");

export default function ReplyScreen({ navigation, route }) {
  const { op } = route.params;

  return (
    <View style={styles.containerStyle}>
      <PostItem
        item={item}
        deletePostsAsync={deletePostsAsync}
        writtenByYou={item.userId === route.params?.myId}
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
}
