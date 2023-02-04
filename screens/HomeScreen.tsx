import { UserPostID } from "lib/posts/UserPost";
import { ReactNode, useEffect, useRef } from "react";
import Modal, { ModalRefType } from "@components/common/Modal";
import { View } from "react-native";

export type HomeScreenViewReply = {
  postId: UserPostID;
  replyId: UserPostID;
};

export type HomeScreenProps = {
  feedView: ReactNode;
  replyView?: (
    viewedReply: HomeScreenViewReply,
    onDismissed: () => void
  ) => ReactNode;
  viewedReply?: HomeScreenViewReply;
};

const HomeScreen = ({ feedView, viewedReply, replyView }: HomeScreenProps) => {
  const modalRef = useRef<ModalRefType>(null);

  useEffect(() => {
    if (!viewedReply) return;
    modalRef.current?.showModal();
  }, [viewedReply]);

  return (
    <View>
      {feedView}
      {viewedReply && replyView && (
        <Modal ref={modalRef}>
          {replyView(viewedReply, () => modalRef.current?.hideModal())}
        </Modal>
      )}
    </View>
  );
};

export default HomeScreen;
