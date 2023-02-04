import { UserPostChannel, UserPostID } from "lib/posts/UserPost";
import { ReactNode, useEffect, useRef } from "react";
import Modal, { ModalRefType } from "@components/common/Modal";
import { View } from "react-native";
import UserPostReplyScreen from "./UserPostReplyScreen";

export type HomeScreenViewReply = {
  postId: UserPostID;
  replyId: UserPostID;
};

export type HomeScreenProps = {
  channel: UserPostChannel;
  feedView: (channel: UserPostChannel) => ReactNode;
  replyView?: (viewedReply: HomeScreenViewReply) => ReactNode;
  viewedReply?: HomeScreenViewReply;
};

const HomeScreen = ({
  channel,
  feedView,
  viewedReply,
  replyView,
}: HomeScreenProps) => {
  const modalRef = useRef<ModalRefType>(null);

  useEffect(() => {
    if (!viewedReply) return;
    modalRef.current?.showModal();
    return () => modalRef.current?.hideModal();
  }, [viewedReply]);

  return (
    <View>
      {feedView(channel)}
      {viewedReply && replyView && (
        <Modal ref={modalRef}>{replyView(viewedReply)}</Modal>
      )}
    </View>
  );
};

export default HomeScreen;
