import { AvatarView } from "@components/Avatar"
import { Caption, Headline, Subtitle } from "@components/Text"
import { EventCard } from "@event/EventCard"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { FriendRequestButton, useFriendRequest } from "@user/FriendRequest"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import {
  UnblockedUserRelationsStatus,
  UserID
} from "TiFShared/domain-models/User"
import { UserProfileDisplayInfo, UserProfileFeature } from "./Context"
import { userProfileQueryKey } from "./QueryKey"
import { useUpcomingEvents } from "./UpcomingEvents"

export type UseUserProfileEnvironment = {
  userId: UserID
}

export const useUserProfile = ({ userId }: UseUserProfileEnvironment) => {
  const { fetchUserProfile } = UserProfileFeature.useContext()
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
          queryKey: userProfileQueryKey(userId)
        }),
      refreshStatus: query.fetchStatus
    }
  } else {
    return { status: query.status }
  }
}

export type UserProfileProps = {
  userInfoState: ReturnType<typeof useUserProfile>
  onRelationStatusChanged: (
    id: UserID,
    status: UnblockedUserRelationsStatus
  ) => void
  upcomingEventsState: ReturnType<typeof useUpcomingEvents>
  style?: StyleProp<ViewStyle>
}

export const UserProfileView = ({
  userInfoState,
  onRelationStatusChanged,
  upcomingEventsState,
  style
}: UserProfileProps) => {
  return (
    <View style={style}>
      <FlatList
        style={style}
        ItemSeparatorComponent={() => <View style={{ padding: 16 }} />}
        data={
          upcomingEventsState.status === "success" &&
          upcomingEventsState.data.status === "success"
            ? upcomingEventsState.data.events
            : undefined
        }
        renderItem={({ item }) => <EventCard event={item}></EventCard>}
        ListHeaderComponent={
          <View>
            <UserInfoView
              state={userInfoState}
              onRelationStatusChanged={onRelationStatusChanged}
            />
            <Subtitle>{"Upcoming Events"}</Subtitle>
          </View>
        }
        ListEmptyComponent={<View></View>}
      />
    </View>
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
  user: UserProfileDisplayInfo
  onRelationStatusChanged: (
    id: UserID,
    status: UnblockedUserRelationsStatus
  ) => void
  style?: StyleProp<ViewStyle>
}

const BaseUserInfoView = ({
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
