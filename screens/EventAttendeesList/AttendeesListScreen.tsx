import { SkeletonView } from "@components/common/Skeleton"
import ConfirmationDialogue from "@components/common/ConfirmationDialogue"
import { delayData } from "@lib/DelayData"
import { AttendeeEntry } from "@screens/EventAttendeesList/attendeeEntry"
import React from "react"
import { FlatList, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { useQuery } from "react-query"
import { AttendeeListMocks } from "./AttendeesMocks"

export const AttendeesListScreen = () => {
  const someQuery = useQuery(["/event/:eventId/attendee", "GET"], () =>
    delayData(AttendeeListMocks.List1)
  )

  const someData = someQuery.data ?? []
  // List of attendees

  type NoAttendeesProps = {
    style?: StyleProp<ViewStyle>
  }

  const NoAttendeesView = ({ style }: NoAttendeesProps) => {
    return (
      <View style={style}>
        <View testID="loading-attendees">
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
    <View style={styles.skeletonContainer}>
      <SkeletonView style={styles.skeletonIcon} />
      <View>
        <SkeletonView style={styles.skeletionHeadline} />
        <SkeletonView style={styles.skeletonCaption} />
      </View>
    </View>
  )

  const FlatSeparator = () => {
    return (
      <View
        style={{
          height: 2,
          width: "100%"
        }}
      />
    )
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        ItemSeparatorComponent={FlatSeparator}
        data={someData}
        renderItem={({ item }) => (
          <>
            <View style={styles.entryContainer}>
              <AttendeeEntry attendee={item} />
              <ConfirmationDialogue
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignSelf: "center",
                  justifyContent: "flex-end"
                }}
                options={["Report"]}
              />
            </View>
          </>
        )}
        ListEmptyComponent={
          <NoAttendeesView style={styles.horizontalPadding} />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  listContainer: { flex: 1, marginTop: 24, marginHorizontal: 16 },
  entryContainer: { flex: 1, flexDirection: "row", marginTop: 8 },
  skeletonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8
  },
  skeletionHeadline: {
    width: 128,
    height: 16,
    marginBottom: 4,
    borderRadius: 12
  },
  skeletonCaption: {
    width: 256,
    height: 12,
    borderRadius: 12
  },
  horizontalPadding: {
    paddingHorizontal: 16
  }
})
