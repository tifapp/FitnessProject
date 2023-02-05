import Modal, { ModalRefType } from "@components/common/Modal";
import CommentsModal from "@components/postComponents/CommentsModal";
import UserPostView from "@components/postComponents/UserPostView";
import React, {
  ComponentProps,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import {
  UserPost,
  UserPostID,
  UserPostMap,
  userPostToPost,
  useUserPostsDependency,
} from "../lib/posts";

export type UserPostReplyScreenProps = {
  postId: UserPostID;
  replyId: UserPostID;
  onDismiss: () => void;
  userPostView?: (post: UserPost, onDeleted?: () => void) => ReactNode;
  fullRepliesView?: (post: UserPost) => ReactNode;
};

const renderUserPost = (post: UserPost, onDeleted?: () => void) => (
  <UserPostView post={post} onDeleted={() => onDeleted?.()} />
);

const renderCommentsModal = (post: UserPost, onDeleted?: () => void) => (
  <CommentsModal
    item={userPostToPost(post)}
    operations={{ removeItem: () => onDeleted?.(), replaceItem: () => {} }}
  />
);

/**
 * A screen to be shown when the user opens the app from a reply notification.
 */
const UserPostReplyScreen = ({
  postId,
  replyId,
  onDismiss,
  userPostView = renderUserPost,
  fullRepliesView = renderCommentsModal,
}: UserPostReplyScreenProps) => {
  const { post, reply, isError, isLoading, retry } = usePostWithReply(
    postId,
    replyId
  );
  const modalRef = useRef<ModalRefType>(null);

  if (isError) {
    return (
      <ErrorPrompt
        errorText="Something went wrong..."
        actionText="Retry"
        actionIcon="cached"
        actionButtonBackgroundColor="#148df7"
        onActionButtonTapped={retry}
      />
    );
  }

  return isLoading ? (
    <ActivityIndicator accessibilityLabel="Loading..." />
  ) : (
    <View>
      {post ? (
        <ScrollView style={{ height: "100%" }}>
          {userPostView(post, onDismiss)}
          {reply ? (
            userPostView(reply)
          ) : (
            <Text
              style={{
                fontWeight: "bold",
                color: "black",
                backgroundColor: "white",
                padding: 8,
                marginBottom: 16,
              }}
            >
              Reply not found.
            </Text>
          )}
          <TouchableOpacity
            onPress={() => modalRef.current?.showModal()}
            style={{
              display: "flex",
              padding: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#148df7",
            }}
          >
            <View>
              <Text style={{ fontWeight: "bold", color: "white" }}>
                View All Replies
              </Text>
              <Text style={{ opacity: 0.75, color: "white" }}>
                This is a single reply from the post.
              </Text>
            </View>
            <MaterialIcons name="arrow-right" size={32} color="white" />
          </TouchableOpacity>
          <Modal ref={modalRef}>{fullRepliesView(post)}</Modal>
        </ScrollView>
      ) : (
        <ErrorPrompt
          errorText="Post not found."
          actionText="Close"
          actionIcon="highlight-off"
          actionButtonBackgroundColor="#e3492d"
          onActionButtonTapped={onDismiss}
        />
      )}
    </View>
  );
};

type ErrorPromptProps = {
  errorText: string;
  actionText: string;
  actionIcon: ComponentProps<typeof MaterialIcons>["name"];
  actionButtonBackgroundColor: string;
  onActionButtonTapped: () => void;
};

const ErrorPrompt = ({
  errorText,
  actionText,
  actionIcon,
  actionButtonBackgroundColor,
  onActionButtonTapped,
}: ErrorPromptProps) => (
  <View style={{ display: "flex", flexDirection: "column" }}>
    <Text
      style={{
        fontWeight: "bold",
        color: "black",
        backgroundColor: "white",
        padding: 8,
      }}
    >
      {errorText}
    </Text>
    <TouchableOpacity onPress={onActionButtonTapped} style={{ marginTop: 16 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          backgroundColor: actionButtonBackgroundColor,
        }}
      >
        <MaterialIcons name={actionIcon} size={24} color="white" />
        <Text style={{ fontWeight: "bold", color: "white", marginLeft: 8 }}>
          {actionText}
        </Text>
      </View>
    </TouchableOpacity>
  </View>
);

const usePostWithReply = (postId: UserPostID, replyId: UserPostID) => {
  const userPosts = useUserPostsDependency();
  const postIdsRef = useRef<UserPostID[]>([postId, replyId]);
  const [postMap, setPostMap] = useState<UserPostMap | undefined>();
  const [isError, setIsError] = useState(false);

  const loadPostMap = useCallback(
    () =>
      userPosts
        .postsWithIds(postIdsRef.current)
        .then(setPostMap)
        .catch(() => setIsError(true)),
    [userPosts]
  );

  // NB: postId and replyId are objects that will cause this to run whenever
  // their addresses change. This is not problematic because this useEffect
  // doesn't summon a meteor from outer space. Additionally these ids are backed
  // by an immutable type that will likely be held in some state variable...
  useEffect(() => {
    postIdsRef.current = [postId, replyId];
  }, [postId, replyId]);

  useEffect(() => {
    loadPostMap();
  }, [loadPostMap]);

  return {
    post: postMap?.get(postId),
    reply: postMap?.get(replyId),
    isError,
    retry: () => {
      setIsError(false);
      setPostMap(undefined);
      loadPostMap();
    },
    isLoading: !postMap,
  };
};

export default UserPostReplyScreen;
