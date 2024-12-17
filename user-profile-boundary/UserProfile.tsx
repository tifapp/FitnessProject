import { AvatarView } from "@components/Avatar"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import { Caption, Headline } from "@components/Text"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AlphaUserStorage } from "@user/alpha"
import {
  FriendRequestButton,
  FriendRequestView,
  useFriendRequest
} from "@user/FriendRequest"
import React, { createContext } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TiFAPI } from "TiFShared/api"
import {
  UnblockedUserRelationsStatus,
  UserID,
  UserProfile
} from "TiFShared/domain-models/User"
import {
  BaseUpcomingEventsView,
  UpcomingEventsResult,
  userUpcomingEvents,
  useUpcomingEvents
} from "./UpcomingEvents"

export type BasicUser = Omit<UserProfile, "createdDateTime" | "updatedDateTime">

export type UserProfileResult =
  | {
      status: "success"
      user: BasicUser
    }
  | { status: "blocked-you" | "user-not-found" }

export const userProfile = async (
  userID: UserID,
  api: TiFAPI = TiFAPI.productionInstance,
  storage: AlphaUserStorage = AlphaUserStorage.default
): Promise<UserProfileResult> => {
  if (storage) {
    const storageData = await storage.user()
    if (storageData && storageData.id === userID) {
      return {
        status: "success",
        user: { ...storageData, relationStatus: "current-user" }
      }
    }
  }
  const resp = await api.getUser({ params: { userId: userID } })
  if (resp.status === 200) {
    return { status: "success", user: resp.data as BasicUser }
  }
  return { status: resp.data.error }
}

export const userProfileQueryKey = (id: UserID, elements: unknown[]) => {
  return ["userProfile", id, ...elements]
}

export type UseUserProfileEnvironment = {
  fetchUserProfile: (userId: UserID) => Promise<UserProfileResult>
  userId: UserID
}

export const useUserProfile = ({
  fetchUserProfile,
  userId
}: UseUserProfileEnvironment) => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: userProfileQueryKey(userId, ["user"]),
    queryFn: async () => await fetchUserProfile(userId)
  })
  if (query.status === "success") {
    return {
      ...query.data,
      refresh: () =>
        queryClient.refetchQueries({
          type: "active",
          queryKey: userProfileQueryKey(userId, [])
        }),
      refreshStatus: query.fetchStatus
    }
  } else {
    return { status: query.status }
  }
}

export type UserProfileContextValues = {
  fetchUserProfile: (id: UserID) => Promise<UserProfileResult>
  fetchUpcomingEvents: (id: UserID) => Promise<UpcomingEventsResult>
}

const UserProfileContext = createContext<UserProfileContextValues>({
  fetchUserProfile: userProfile,
  fetchUpcomingEvents: userUpcomingEvents
})

export type UserProfileProviderProps = UserProfileContextValues & {
  children: JSX.Element
}

export const UserProfileProvider = ({
  children,
  ...values
}: UserProfileProviderProps) => (
  <UserProfileContext.Provider value={values}>
    {children}
  </UserProfileContext.Provider>
)

export type UserProfileProps = {
  userId: UserID
  userInfoState: ReturnType<typeof useUserProfile>
  friendRequestState: ReturnType<typeof useFriendRequest>
  onRelationStatusChanged: (
    id: UserID,
    status: UnblockedUserRelationsStatus
  ) => void
  upcomingEventsState: ReturnType<typeof useUpcomingEvents>
  style?: StyleProp<ViewStyle>
}

export const UserProfileView = ({
  userId,
  userInfoState,
  friendRequestState,
  onRelationStatusChanged,
  upcomingEventsState,
  style
}: UserProfileProps) => {
  return (
    <TiFFormScrollView style={style}>
      <FriendRequestView state={friendRequestState}>
        <UserInfoView
          state={userInfoState}
          onRelationStatusChanged={onRelationStatusChanged}
        />
      </FriendRequestView>
      <UpcomingEventsView
        state={upcomingEventsState}
        isShown={upcomingEventsState.status === "success"}
      />
    </TiFFormScrollView>
  )
}

export type UserInfoProps = {
  state: ReturnType<typeof useUserProfile>
  onRelationStatusChanged: (
    id: UserID,
    status: UnblockedUserRelationsStatus
  ) => void
  style?: StyleProp<ViewStyle>
}

export const UserInfoView = ({
  state,
  onRelationStatusChanged,
  style
}: UserInfoProps) => {
  return (
    <View style={style}>
      {state.status === "success" ? (
        <BaseUserInfoView
          user={state.user}
          style={style}
          onRelationStatusChanged={onRelationStatusChanged}
        />
      ) : (
        <View></View>
      )}
    </View>
  )
}

export type BaseUserInfoViewProps = {
  user: BasicUser
  onRelationStatusChanged: (
    id: UserID,
    status: UnblockedUserRelationsStatus
  ) => void
  style?: StyleProp<ViewStyle>
}

export const BaseUserInfoView = ({
  user,
  onRelationStatusChanged,
  style
}: BaseUserInfoViewProps) => {
  const state = useFriendRequest({
    user,
    onSuccess: (status) => onRelationStatusChanged(user.id, status)
  })
  return (
    <View style={style}>
      <AvatarView
        name={user.name}
        maximumFontSizeMultiplier={1.2}
        style={styles.profileFrame}
      />
      <Headline style={styles.username}>{user.name}</Headline>
      <Caption style={styles.handle}>{user.handle.toString()}</Caption>
      <FriendRequestButton state={state} />
    </View>
  )
}

export type UpcomingEventsProps = {
  state: ReturnType<typeof useUpcomingEvents>
  isShown: boolean
  style?: StyleProp<ViewStyle>
}

export const UpcomingEventsView = ({
  state,
  isShown,
  style
}: UpcomingEventsProps) => {
  return (
    <View style={style}>
      {isShown && state.data?.status === "success" ? (
        <BaseUpcomingEventsView events={state.data.events} style={style} />
      ) : (
        <View></View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  profileFrame: {
    height: 128,
    width: 128,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    alignContent: "center"
  },
  username: {
    alignItems: "center",
    alignSelf: "center"
  },
  handle: {
    paddingBottom: 16,
    alignItems: "center",
    alignSelf: "center"
  }
})
