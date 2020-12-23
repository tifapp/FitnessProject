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
  ActivityIndicator,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

var styles = require("../styles/stylesheet");

export default function PaginatedList(props) {
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextToken, setNextToken] = useState(null); //for pagination

  const loadMore = () => {
    setLoadingMore(true);
    showMorePostsAsync()
      .finally(() => { setLoadingMore(false) });
  }

  return (
    <View>
      <FlatList
        data={posts}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <PostItem
            item={item}
            deletePostsAsync={deletePostsAsync}
            writtenByYou={item.userId === route.params?.id}
            setPostVal={setPostVal}
            setUpdatePostID={setUpdatePostID}
          />
        )}
        keyExtractor={(item, index) => item.timestamp.toString() + item.userId}
        onEndReached={loadMore}
        onEndReachedThreshold={1}
      />

      {
        loadingMore
          ?
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 20
            }} />
          : null
      }
    </View>
  )
}
