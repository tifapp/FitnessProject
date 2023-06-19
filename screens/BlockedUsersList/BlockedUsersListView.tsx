import React from "react"
import { BodyText, Subtitle } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import {
  FlatList,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { useQuery } from "react-query"
import { SkeletonView } from "@components/common/Skeleton"
import { delayData } from "@lib/DelayData"
import { AttendeeListMocks } from "@screens/EventAttendeesList/AttendeesMocks"
import { EventAttendee } from "@lib/events"
import BlockedUserEntry from "./BlockedUserEntry"

const BlockedUsersListView = () => {
  const getUsers = useQuery(["/event/:eventId/attendee", "GET"], () =>
    delayData(AttendeeListMocks.List1)
  )

  const blockedUsers = getUsers.data ?? []
  // List of attendees

  type LoadingUsersProps = {
    style?: StyleProp<ViewStyle>
  }

  const LoadingUsersView = ({ style }: LoadingUsersProps) => {
    return (
      <View style={style}>
        <View testID="loading-blocked-users">
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
          <SkeletonResult />
        </View>
      </View>
    )
  }

  const SkeletonResult = () => (
    <View style={[styles.skeletonContainer, styles.container]}>
      <SkeletonView style={[styles.image, styles.skeletonIcon]} />
      <View>
        <SkeletonView style={styles.skeletonHeadline} />
        <SkeletonView style={styles.skeletonCaption} />
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Subtitle style={[styles.title, styles.horizontalPadding]}>
        Blocked Users
      </Subtitle>
      <BodyText style={[styles.body, styles.horizontalPadding]}>
        Users you have blocked cannot join your events or view your profile, but
        you can still view their profile.
      </BodyText>

      <FlatList
        data={blockedUsers}
        renderItem={({ item }: ListRenderItemInfo<EventAttendee>) => (
          <BlockedUserEntry attendee={item} />
        )}
        ListEmptyComponent={
          <LoadingUsersView
            style={[styles.listContainer, styles.horizontalPadding]}
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white"
  },
  title: {
    marginBottom: 8
  },
  body: {
    color: AppStyles.colorOpacity50,
    marginBottom: 24
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  listContainer: {
    marginBottom: 16,
    flexDirection: "row"
  },
  skeletonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16
  },
  horizontalPadding: {
    marginHorizontal: 16
  },
  skeletonIcon: {
    marginRight: 16
  },
  skeletonHeadline: {
    width: 256,
    height: 16,
    marginBottom: 4,
    borderRadius: 12
  },
  skeletonCaption: {
    width: 128,
    height: 12,
    borderRadius: 12
  }
})

export default BlockedUsersListView
