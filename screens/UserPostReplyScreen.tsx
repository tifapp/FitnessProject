import Modal, { ModalRefType } from "@components/common/Modal";
import CommentsModal from "@components/postComponents/CommentsModal";
import UserPostView from "@components/postComponents/UserPostView";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
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
      <View>
        <Text>Something went wrong...</Text>
        <Button title="Retry" onPress={retry} />
      </View>
    );
  }

  return isLoading ? (
    <LoadingIndicator />
  ) : (
    <View>
      {post ? (
        <View>
          {userPostView(post, onDismiss)}
          {reply ? userPostView(reply) : <Text>Reply not found.</Text>}
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
        </View>
      ) : (
        <View>
          <Text>Post not found.</Text>
          <Button title="Close" onPress={onDismiss} />
        </View>
      )}
    </View>
  );
};

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

const LoadingIndicator = () => (
  <ActivityIndicator accessibilityLabel="Loading..." />
);

export default UserPostReplyScreen;
