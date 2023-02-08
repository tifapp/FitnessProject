import { ReactNode, useEffect, useRef } from "react"
import Modal, { ModalRefType } from "@components/common/Modal"
import UserPostReplyScreen from "./UserPostReplyScreen"

/**
 * A type representing a reply to view when the user opens the app
 * from a reply notification.
 */
export type HomeScreenViewReply = {
  postId: string;
  replyId: string;
};

/**
 * Parses a `HomeScreenViewReply` from navigation route params.
 */
export const homeScreenViewedReplyFromRouteParams = (
  params: Readonly<object | undefined>
): HomeScreenViewReply | undefined => {
  if (!params) return undefined
  const { postId, replyId } = params as any
  if (!replyId || !postId) return undefined
  return {
    postId,
    replyId
  }
}

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
) => <UserPostReplyScreen {...viewedReply} onDismiss={onDismissed} />

/**
 * The main screen when the app opens.
 */
const HomeScreen = ({
  feedView,
  viewedReply,
  replyView = renderReplyScreen
}: HomeScreenProps) => {
  const modalRef = useRef<ModalRefType>(null)

  useEffect(() => {
    if (!viewedReply) return
    modalRef.current?.showModal()
  }, [viewedReply])

  return (
    <>
      {feedView}
      {viewedReply && replyView && (
        <Modal ref={modalRef}>
          {replyView(viewedReply, () => modalRef.current?.hideModal())}
        </Modal>
      )}
    </>
  )
}

export default HomeScreen
