// @ts-nocheck
import PostItem from "@components/PostItem";
// Get the aws resources configuration parameters
import FeedScreen from "@screens/FeedScreen";
import React from "react";
import { View } from "react-native";

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

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: "#fffffd",
  },
});
