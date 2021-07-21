import React, { useState, useEffect, useRef, } from "react";
import {
  Text,
  View,
  SafeAreaView,
  LayoutAnimation,
} from "react-native";
// Get the aws resources configuration parameters
import { API, graphqlOperation, Cache } from "aws-amplify";
import { batchGetLikes, likesByPost } from "root/src/graphql/queries";
import { onCreateLikeForPost, onDeleteLikeForPost, } from 'root/src/graphql/subscriptions';
import { ProfileImageAndName } from "components/ProfileImageAndName";
import printTime from "hooks/printTime";
import APIList from 'components/APIList';

require('root/androidtimerfix');

var styles = require('styles/stylesheet');

export default function LikesList({ postId }) {
  const [likedUsers, setLikedUsers] = useState([]);
  const currentLikedUsers = useRef();
  
  currentLikedUsers.current = likedUsers;

  useEffect(() => {
    const createLikeSubscription = API.graphql(graphqlOperation(onCreateLikeForPost, { postId: postId })).subscribe({
      next: event => {
        const newLike = event.value.data.onCreateLikeForPost
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setLikedUsers([newLike, ...currentLikedUsers.current]);
      }
    });
    const deleteLikeSubscription = API.graphql(graphqlOperation(onDeleteLikeForPost, { postId: postId })).subscribe({
      next: event => {
        const deletedLike = event.value.data.onDeleteLikeForPost
        if (currentLikedUsers.current.find(like => like.userId === deletedLike.userId)) {
          let templikes = [...currentLikedUsers.current];
          var index = templikes.findIndex(like => like.userId === deletedLike.userId);
          templikes.splice(index, 1);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setLikedUsers(templikes);
        }
      }
    });
    return () => {
      createLikeSubscription.unsubscribe();
      deleteLikeSubscription.unsubscribe();
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APIList
        initialAmount={10}
        additionalAmount={20}
        horizontal={true}
        queryOperation={likesByPost}
        filter={{ postId: postId, sortDirection: "DESC" }}
        data={likedUsers}
        setDataFunction={setLikedUsers}
        renderItem={({ item }) => (
          <View>
            <ProfileImageAndName
              vertical={true}
              hidename={true}
              imageStyle={[
                styles.smallImageStyle,
                { marginHorizontal: 0 },
              ]}
              userId={item.userId}
            />
            <Text style={{ color: "gray", alignSelf: "center" }}>{printTime(item.createdAt)}</Text>
          </View>
        )}
        keyExtractor={(item) => item.userId}
      />
    </SafeAreaView>
  );
};