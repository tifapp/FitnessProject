import Modal, { ModalRefType } from "@components/common/Modal";
import UserPostView from "@components/postComponents/UserPostView";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import {
  UserPost,
  UserPostID,
  UserPostMap,
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

/**
 * A screen to be shown when the user opens the app from a reply notification.
 */
const UserPostReplyScreen = ({
  postId,
  replyId,
  onDismiss,
  userPostView = renderUserPost,
  fullRepliesView = renderUserPost, // TODO: - This should be the comments modal
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
          <Button
            title="View All"
            onPress={() => modalRef.current?.showModal()}
          />
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
  // doesn't summon a meteor from outer space. Additionally these ids will
  // likely by held in useState variables from the outside, so this probably
  // won't even run very often...
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
      loadPostMap();
    },
    isLoading: !postMap,
  };
};

const LoadingIndicator = () => (
  <ActivityIndicator accessibilityLabel="Loading..." />
);

export default UserPostReplyScreen;
