import { UserPost, userPostToPost } from "../lib/posts/UserPost";
import { Button } from "react-native";
import API, { graphqlOperation } from "@aws-amplify/api";
import { useRef } from "react";
import Modal, { ModalRefType } from "@components/common/Modal";
import CommentsModal from "@components/postComponents/CommentsModal";
import PostItem from "@components/PostItem";

export type PostWithReplyDetailScreenProps = {
  post: UserPost;
  reply: UserPost;
};

const PostWithReplyDetailScreen = ({
  post,
  reply,
}: PostWithReplyDetailScreenProps) => {
  const repliesModalRef = useRef<ModalRefType>(null);
  return (
    <>
      <PostItem
        item={userPostToPost(post)}
        likes={post.likesCount}
        reportPost={async () => 1}
        operations={{ removeItem: () => {}, replaceItem: () => {} }}
        writtenByYou={post.writtenByYou}
        isVisible={false}
        shouldSubscribe={true}
      />
      <Button
        title="View All"
        onPress={() => repliesModalRef.current?.showModal()}
      />
      <Modal ref={repliesModalRef}>
        <CommentsModal
          item={userPostToPost(post)}
          operations={{ removeItem: () => {}, replaceItem: () => {} }}
        />
      </Modal>
    </>
  );
};

export default PostWithReplyDetailScreen;
