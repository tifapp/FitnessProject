import { TextToastView } from "@components/common/Toasts"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { useFormSubmission } from "@lib/utils/Form"
import {
  UserHandle,
  UserID,
  UserRelationsStatus
} from "TiFShared/domain-models/User"
import { ReactNode } from "react"
import { View, ViewStyle, StyleProp } from "react-native"

export const ALERTS = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "user-not-found": (
    user: Omit<FriendRequestUser, "relationStatus" | "id">
  ) => ({
    title: "User Not Found",
    description: `${user.name} (${user.handle}) does not seem to exist.`
  }),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "blocked-you": (user: Omit<FriendRequestUser, "relationStatus" | "id">) => ({
    title: "You've Been Blocked",
    description: `It seems that ${user.name} (${user.handle}) has blocked you. Try getting on better terms with them before becoming friends.`
  }),
  genericError: {
    title: "Uh Oh!",
    description: "It seems that something has gone wrong. Please try again."
  }
} satisfies AlertsObject

export type FriendRequestUser = {
  id: UserID
  name: string
  handle: UserHandle
  relationStatus: UserRelationsStatus
}

export type UseFriendRequestEnvironment = {
  user: FriendRequestUser
  sendFriendRequest: (
    id: UserID
  ) => Promise<
    "friends" | "friend-request-sent" | "user-not-found" | "blocked-you"
  >
  onSuccess: (status: "friends" | "friend-request-sent") => void
}

const REQUESTABLE_RELATION_STATUSES = ["not-friends", "friend-request-received"]

const isSuccessfulStatus = (
  status: string | undefined
): status is "friends" | "friend-request-sent" => {
  return status === "friends" || status === "friend-request-sent"
}

/**
 * A generic hook to use for friend request behavior.
 *
 * This hook should be used on with any UI element that needs to send or accept friend requests to
 * and from other users. You use this hook in conjunction with {@link FriendRequestView} to manage
 * friend request flow for your UI element.
 *
 * The `onSuccess` callback is called when the friend request is sent successfully to the other
 * user. You receive the updated status in the callback, and can use it to update any UI state
 * related to the user's relation status with the current user.
 */
export const useFriendRequest = ({
  user,
  sendFriendRequest,
  onSuccess
}: UseFriendRequestEnvironment) => {
  const submission = useFormSubmission(
    (user: FriendRequestUser) => sendFriendRequest(user.id),
    () => {
      if (REQUESTABLE_RELATION_STATUSES.includes(user.relationStatus)) {
        return { status: "submittable", submissionValues: user }
      }
      return { status: "invalid" }
    },
    {
      onSuccess: (status, user: FriendRequestUser) => {
        if (!isSuccessfulStatus(status)) {
          presentAlert(ALERTS[status](user))
        } else {
          onSuccess(status)
        }
      },
      onError: () => presentAlert(ALERTS.genericError)
    }
  )
  return {
    user,
    updatedStatus: isSuccessfulStatus(submission.result)
      ? submission.result
      : undefined,
    submission
  }
}

export type FriendRequestProps = {
  state: ReturnType<typeof useFriendRequest>
  style?: StyleProp<ViewStyle>
  children: ReactNode
}

/**
 * A generic view for UI elements that need to be able to send friend and accept friend requests.
 *
 * See {@link useFriendRequest} for more.
 */
export const FriendRequestView = ({
  state,
  style,
  children
}: FriendRequestProps) => (
  <View style={style}>
    {children}
    <TextToastView
      isVisible={state.updatedStatus === "friends"}
      text={`${state.user.name} (${state.user.handle}) has been added as your friend!`}
    />
    <TextToastView
      isVisible={state.updatedStatus === "friend-request-sent"}
      text={`Friend request sent to ${state.user.name} (${state.user.handle}).`}
    />
  </View>
)
