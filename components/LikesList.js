// @ts-nocheck
// Get the aws resources configuration parameters
import APIList from "@components/APIList";
import { ProfileImageAndName } from "@components/ProfileImageAndName";
import { likesByPost } from "@graphql/queries";
import {
  onCreateLikeForPost,
  onDeleteLikeForPost,
} from "@graphql/subscriptions";
import printTime from "@hooks/printTime";
import { API, graphqlOperation } from "aws-amplify";
import React, { useEffect, useRef } from "react";
import { LayoutAnimation, SafeAreaView, Text } from "react-native";

require("root/androidtimerfix");

export default function LikesList({ postId }) {
  const listRef = useRef();

  useEffect(() => {
    const createLikeSubscription = API.graphql(
      graphqlOperation(onCreateLikeForPost, { postId: postId })
    ).subscribe({
      next: (event) => {
        const newLike = event.value.data.onCreateLikeForPost;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        listRef.mutateData((data) => [newLike, ...data]);
      },
    });
    const deleteLikeSubscription = API.graphql(
      graphqlOperation(onDeleteLikeForPost, { postId: postId })
    ).subscribe({
      next: (event) => {
        const deletedLike = event.value.data.onDeleteLikeForPost;
        listRef.mutateData((data) => {
          if (data.find((like) => like.userId === deletedLike.userId)) {
            let templikes = [...data];
            var index = templikes.findIndex(
              (like) => like.userId === deletedLike.userId
            );
            templikes.splice(index, 1);
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            return templikes;
          }
        });
      },
    });
    return () => {
      createLikeSubscription.unsubscribe();
      deleteLikeSubscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APIList
        ref={listRef}
        initialAmount={10}
        additionalAmount={20}
        queryOperation={likesByPost}
        filter={{ postId: postId, sortDirection: "DESC" }}
        renderItem={({ item }) => (
          <ProfileImageAndName
            style={{ margin: 15 }}
            userId={item.userId}
            subtitleComponent={
              <Text style={{ color: "gray" }}>{printTime(item.createdAt)}</Text>
            }
          />
        )}
        keyExtractor={(item) => item.userId}
      />
    </SafeAreaView>
  );
}
