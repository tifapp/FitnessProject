import { UserPostID } from "../lib/posts";
import { ReactNode, useEffect, useRef } from "react";
import Modal, { ModalRefType } from "@components/common/Modal";
import UserPostReplyScreen from "./UserPostReplyScreen";

export type HomeScreenViewReply = {
  postId: UserPostID;
  replyId: UserPostID;
};

/**
 * Parses a `HomeScreenViewReply` from a navigation route.
 */
export const homeScreenViewedReplyFromRouteParams = (
  params: Readonly<object | undefined>
): HomeScreenViewReply | undefined => {
  if (!params) return undefined;
  const { postId, replyId } = params;
  if (!replyId || !postId) return undefined;
  return {
    postId: new UserPostID(postId),
    replyId: new UserPostID(replyId),
  };
};

export type HomeScreenProps = {
  feedView: ReactNode;
  replyView?: (
    viewedReply: HomeScreenViewReply,
    onDismissed: () => void
  ) => ReactNode;
  viewedReply?: HomeScreenViewReply;
};

const renderReplyScreen = (
  viewedReply: HomeScreenViewReply,
  onDismissed: () => void
) => <UserPostReplyScreen {...viewedReply} onDismiss={onDismissed} />;

const HomeScreen = ({
  feedView,
  viewedReply,
  replyView = renderReplyScreen,
}: HomeScreenProps) => {
  const modalRef = useRef<ModalRefType>(null);

  useEffect(() => {
    if (!viewedReply) return;
    modalRef.current?.showModal();
  }, [viewedReply]);

  return (
    <>
      {feedView}
      {viewedReply && replyView && (
        <Modal ref={modalRef}>
          {replyView(viewedReply, () => modalRef.current?.hideModal())}
        </Modal>
      )}
    </>
  );
};

export default HomeScreen;
