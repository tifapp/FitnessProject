import { Auth } from "aws-amplify";
import React, { useRef } from "react";
import Modal, { ModalRefType } from "@components/common/Modal";
import {
  UserPosts,
  TestUserPosts,
  UserPostsProvider,
  groupUserPosts,
} from "../lib/posts";
import { Alert, Button, Text, TouchableOpacity, View } from "react-native";
import UserPostReplyScreen from "./UserPostReplyScreen";

const userPosts: UserPosts = {
  postsWithIds: async () =>
    groupUserPosts([TestUserPosts.writtenByYou, TestUserPosts.blob]),
};

const ActivitiesScreen = () => {
  const modalRef = useRef<ModalRefType>(null);
  function signOut() {
    const title = "Are you sure you want to sign out?";
    const message = "";
    Alert.alert(
      title,
      message,
      [
        {
          text: "Yes",
          onPress: () => {
            Auth.signOut();
          },
        }, //if submithandler fails user won't know
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity onPress={signOut}>
        <Text
          style={{
            fontSize: 15,
            margin: 20,
          }}
        >
          Log Out
        </Text>
      </TouchableOpacity>
      <Button
        title="Open Reply screen"
        onPress={() => modalRef.current?.showModal()}
      />
      <Modal ref={modalRef}>
        <UserPostsProvider posts={userPosts}>
          <UserPostReplyScreen
            postId={TestUserPosts.writtenByYou.id}
            replyId={TestUserPosts.blob.id}
            onDismiss={() => modalRef.current?.hideModal()}
          />
        </UserPostsProvider>
      </Modal>
    </View>
  );
};

export default ActivitiesScreen;
