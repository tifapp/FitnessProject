import { UserPost, userPostToPost } from "../../lib/posts/UserPost";
import { Button } from "react-native";
import { useRef } from "react";
import Modal, { ModalRefType } from "@components/common/Modal";
import PostItem from "@components/PostItem";

export type PostWithSingleReplyProps = {
  post: UserPost;
  reply: UserPost;
  fullRepliesView: (post: UserPost) => JSX.Element;
};

const PostWithSingleReplyView = ({
  post,
  reply,
  fullRepliesView,
}: PostWithSingleReplyProps) => {
  const repliesModalRef = useRef<ModalRefType>(null);
  return (
    <>
      <Button
        title="View All"
        onPress={() => repliesModalRef.current?.showModal()}
      />
      <Modal ref={repliesModalRef}>{fullRepliesView(post)}</Modal>
    </>
  );
};

export default PostWithSingleReplyView;
