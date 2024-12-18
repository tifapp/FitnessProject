import { FormSubmissionPrimaryButton } from "@components/Buttons"
import { BoldFootnote, Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import { TextToastView } from "@components/common/Toasts"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { AppStyles } from "@lib/AppColorStyle"
import { featureContext } from "@lib/FeatureContext"
import { useFormSubmission } from "@lib/utils/Form"
import { TiFAPI } from "TiFShared/api"
import {
  UserHandle,
  UserID,
  UserRelationsStatus
} from "TiFShared/domain-models/User"
import { ReactNode, createContext, useContext } from "react"
import { View, ViewStyle, StyleProp, StyleSheet } from "react-native"

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
    description: `It seems that ${user.name} (${user.handle}) has blocked you.`
  }),
  genericError: {
    title: "Uh Oh!",
    description: "It seems that something has gone wrong. Please try again."
  }
} satisfies AlertsObject

export type SendFriendRequestResult =
  | "friends"
  | "friend-request-sent"
  | "user-not-found"
  | "blocked-you"

export const sendFriendRequest = async (
  userId: UserID,
  api: TiFAPI = TiFAPI.productionInstance
): Promise<SendFriendRequestResult> => {
  const resp = await api.sendFriendRequest({ params: { userId } })
  if (resp.status === 403 || resp.status === 404) return resp.data.error
  return resp.data.relationStatus
}

export type FriendRequestUser = {
  id: UserID
  name: string
  handle: UserHandle
  relationStatus: UserRelationsStatus
}

export type UseFriendRequestEnvironment = {
  user: FriendRequestUser
  onSuccess: (status: "friends" | "friend-request-sent") => void
}

export const FriendRequestFeature = featureContext({
  sendFriendRequest
})

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
  onSuccess
}: UseFriendRequestEnvironment) => {
  const { sendFriendRequest } = FriendRequestFeature.useContext()
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

export type FriendRequestButtonProps = Omit<FriendRequestProps, "children"> & {
  size?: "normal" | "large"
}

export const FriendRequestButton = ({
  state,
  size = "normal",
  style
}: FriendRequestButtonProps) => {
  const [ButtonText, iconSize, buttonStyle] = BUTTON_SIZE_PROPS[size]
  return (
    <FriendRequestView state={state} style={style}>
      {state.user.relationStatus === "friends" && (
        <View style={styles.friendButtonRow}>
          <Ionicon
            name="people"
            color={AppStyles.colorOpacity35}
            size={iconSize}
          />
          <ButtonText style={styles.nonActionableFriendText}>
            Friends
          </ButtonText>
        </View>
      )}
      {state.user.relationStatus === "friend-request-sent" && (
        <View style={styles.friendButtonRow}>
          <Ionicon
            name="paper-plane"
            color={AppStyles.colorOpacity35}
            size={iconSize}
          />
          <ButtonText style={styles.nonActionableFriendText}>
            Request Sent
          </ButtonText>
        </View>
      )}
      {state.user.relationStatus === "friend-request-received" && (
        <FormSubmissionPrimaryButton
          submission={state.submission}
          style={buttonStyle}
        >
          <View style={styles.friendButtonRow}>
            <Ionicon name="mail" color="white" size={iconSize} />
            <ButtonText style={styles.friendButtonText}>Accept</ButtonText>
          </View>
        </FormSubmissionPrimaryButton>
      )}
      {state.user.relationStatus === "not-friends" && (
        <FormSubmissionPrimaryButton
          submission={state.submission}
          style={buttonStyle}
        >
          <View style={styles.friendButtonRow}>
            <Ionicon name="person-add" color="white" size={iconSize} />
            <ButtonText style={styles.friendButtonText}>Friend</ButtonText>
          </View>
        </FormSubmissionPrimaryButton>
      )}
    </FriendRequestView>
  )
}

const styles = StyleSheet.create({
  friendButtonRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8
  },
  friendButtonText: {
    color: "white"
  },
  nonActionableFriendText: {
    color: AppStyles.colorOpacity35
  },
  friendButton: {
    padding: 8
  },
  largeFriendButton: {
    padding: 12
  }
})

const BUTTON_SIZE_PROPS = {
  normal: [BoldFootnote, 16, styles.friendButton],
  large: [Headline, 20, styles.largeFriendButton]
} as const
