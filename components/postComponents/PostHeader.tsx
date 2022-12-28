import LikeButton from "@components/postComponents/LikeButton";
import { ProfileImageAndName } from "@components/ProfileImageAndName";
import printTime from "@hooks/printTime";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Post } from "src/models";
import IconButton from "../common/IconButton";

interface Props {
  likes: number,
  item: Post & {loading: boolean, likedByYou: boolean},
  writtenByYou: boolean,
  repliesPressed: () => void,
  areRepliesVisible: boolean,
  shouldSubscribe: boolean
}

export default function PostHeader({
  item,
  writtenByYou,
  repliesPressed,
  areRepliesVisible,
  shouldSubscribe,
} : Props) {
  const [likes, setLikes] = useState(item.likes);
  const [replies, setReplies] = useState(item.replies);
  const likeDebounce = useRef(false);
  let incrementLikeSubscription,
    decrementLikeSubscription,
    incrementReplySubscription,
    decrementReplySubscription;

  useEffect(() => {
    if (!item.loading) {
      if (shouldSubscribe === true) {
        //should be true by default
        incrementLikeSubscription = API.graphql(
          graphqlOperation(onIncrementLikes, {
            createdAt: item.createdAt,
            userId: item.userId,
          })
        ).subscribe({
          //nvm we dont have a subscription event for incrementlike
          next: (event) => {
            if (likeDebounce.current) {
              likeDebounce.current = false;
            } else {
              setLikes(event.value.data.onIncrementLikes.likes);
              item.likes = event.value.data.onIncrementLikes.likes;
            }
          },
          error: (error) => console.warn(error),
        });
        decrementLikeSubscription = API.graphql(
          graphqlOperation(onDecrementLikes, {
            createdAt: item.createdAt,
            userId: item.userId,
          })
        ).subscribe({
          //nvm we dont have a subscription event for incrementlike
          next: (event) => {
            if (likeDebounce.current) {
              likeDebounce.current = false;
            } else {
              setLikes(event.value.data.onDecrementLikes.likes);
              item.likes = event.value.data.onDecrementLikes.likes;
            }
          },
          error: (error) => console.warn(error),
        });
        incrementReplySubscription = API.graphql(
          graphqlOperation(onIncrementReplies, {
            createdAt: item.createdAt,
            userId: item.userId,
          })
        ).subscribe({
          //nvm we dont have a subscription event for incrementlike
          next: (event) => {
            setReplies(event.value.data.onIncrementReplies.replies);
            item.replies = event.value.data.onIncrementReplies.replies;
          },
          error: (error) => console.warn(error),
        });
        decrementReplySubscription = API.graphql(
          graphqlOperation(onDecrementReplies, {
            createdAt: item.createdAt,
            userId: item.userId,
          })
        ).subscribe({
          //nvm we dont have a subscription event for incrementlike
          next: (event) => {
            setReplies(event.value.data.onDecrementReplies.replies);
            item.replies = event.value.data.onDecrementReplies.replies;
          },
          error: (error) => console.warn(error),
        });
      } else if (shouldSubscribe === false) {
        if (incrementLikeSubscription) incrementLikeSubscription.unsubscribe();
        if (decrementLikeSubscription) decrementLikeSubscription.unsubscribe();
        if (incrementReplySubscription)
          incrementReplySubscription.unsubscribe();
        if (decrementReplySubscription)
          decrementReplySubscription.unsubscribe();
      }

      return () => {
        //console.log("removing subscriptions and post info is: ", item.userId, "\n")
        if (incrementLikeSubscription) incrementLikeSubscription.unsubscribe();
        if (decrementLikeSubscription) decrementLikeSubscription.unsubscribe();
        if (incrementReplySubscription)
          incrementReplySubscription.unsubscribe();
        if (decrementReplySubscription)
          decrementReplySubscription.unsubscribe();
      };
    }
  }, [shouldSubscribe]);

  useEffect(() => {
    setLikes(item.likes);
  }, [item.likes]); //to change the feed screen
  useEffect(() => {
    setReplies(item.replies);
  }, [item.replies]);

  return (
    <View
      style={{
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <ProfileImageAndName
        textStyle={{
          fontWeight: writtenByYou ? "bold" : "normal",
        }}
        userId={item.userId}
        subtitleComponent={
          <Text style={{ color: "gray" }}>{printTime(item.createdAt)}</Text>
        }
      />

      {!item.loading ? (
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
            alignSelf: "stretch",
          }}
        >
          <LikeButton
            likes={likes ?? 0}
            item={item}
            postId={item.createdAt + "#" + item.userId}
            likeDebounceRef={likeDebounce}
            onTap={(liked) => {
              if (liked) {
                setLikes((likes) => likes - 1);
                item.likes -= 1;
                item.likedByYou = false;
              } else {
                setLikes((likes) => likes + 1);
                item.likes += 1;
                item.likedByYou = true;
              }
            }}
          />
          <IconButton
            iconName={"chat-bubble-outline"}
            size={17}
            color={areRepliesVisible ? "blue" : "gray"}
            label={replies + ""}
            isLabelFirst={true}
            onPress={repliesPressed}
            textStyle={{fontWeight: "bold"}}
          />
        </View>
      ) : null}
    </View>
  );
}
