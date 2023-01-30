import { UserPost, userPostToPost } from "@lib/posts/types";
import { Button } from "react-native";
import API, { graphqlOperation } from "@aws-amplify/api";
import { useRef } from "react";
import Modal, { ModalRefType } from "@components/common/Modal";
import CommentsModal from "@components/postComponents/CommentsModal";

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
