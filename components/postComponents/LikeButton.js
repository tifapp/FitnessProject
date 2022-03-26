// @ts-nocheck
import { createLike, deleteLike } from "@graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import playSound from "../../hooks/playSound";
import IconButton from "../common/IconButton";

export default function LikeButton({
  onTap,
  likes,
  myId,
  item,
  postId,
  likeDebounceRef,
}) {
  const [liked, setLiked] = useState(item.likedByYou);
  const likeRef = useRef();
  const timerIsRunning = useRef();
  const likeTimeout = useRef();

  useEffect(() => {
    setLiked(item.likedByYou);
  }, [item.likedByYou]);

  const resetTimeout = () => {
    //if there's already a timeout running do not update ref
    //if there isn't, update ref
    if (!timerIsRunning.current) {
      likeRef.current = liked;
    }
    timerIsRunning.current = true;
    clearTimeout(likeTimeout.current);
    likeTimeout.current = setTimeout(sendAPICall, 1000);
  };

  const sendAPICall = () => {
    likeDebounceRef.current = true;
    if (liked == likeRef.current) {
      //console.log("sent API call, hopefully debounce works.");
      if (!liked) {
        API.graphql(
          graphqlOperation(createLike, { input: { postId: postId } })
        );
      } else {
        API.graphql(
          graphqlOperation(deleteLike, {
            input: { userId: myId, postId: postId },
          })
        );
      }
    }

    timerIsRunning.current = false;
  };

  const likePostAsync = async () => {
    liked ? playSound("unlike") : playSound("like");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      onTap(liked);
      setLiked(!liked);
      resetTimeout();
    } catch (err) {
      console.log(err);
      // @ts-ignore
      alert("Could not be submitted!");
    }
  };

  return (
    <IconButton
      iconName={liked ? "favorite" : "favorite-outline"}
      size={17}
      color={liked ? "red" : "gray"}
      label={likes + ""}
      isLabelFirst={true}
      onPress={likePostAsync}
      fontWeight={"bold"}
    />
  );
}
