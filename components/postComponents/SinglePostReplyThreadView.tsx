import { UserPost } from "../../lib/posts/UserPost";
import { Button } from "react-native";
import { ReactNode, useRef } from "react";
import Modal, { ModalRefType } from "@components/common/Modal";

export type SinglePostReplyThreadProps = {
  post: UserPost;
  reply: UserPost;
  renderItem: (post: UserPost) => ReactNode;
  renderFullRepliesView: (post: UserPost) => ReactNode;
};

const SinglePostReplyThreadView = ({
  post,
  reply,
  renderFullRepliesView,
}: SinglePostReplyThreadProps) => {
  const repliesModalRef = useRef<ModalRefType>(null);
  return (
    <>
      <Button
        title="View All"
        onPress={() => repliesModalRef.current?.showModal()}
      />
      <Modal ref={repliesModalRef}>{renderFullRepliesView(post)}</Modal>
    </>
  );
};

export default SinglePostReplyThreadView;
