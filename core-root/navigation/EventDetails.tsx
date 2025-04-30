import { useBackButton, useTiFNavigation } from "@components/Navigation"
import { TouchableIonicon } from "@components/common/Icons"
import { DashedLine } from "@components/form-components/DashedLine"
import {
  EventAttendeesListView,
  useEventAttendeesList
} from "@event-details-boundary/AttendeesList"
import { EventDetailsContentView } from "@event-details-boundary/Content"
import { EventDetailsView } from "@event-details-boundary/Details"
import { useLoadEventDetails } from "@event/DetailsQuery"
import { AppStyles } from "@lib/AppColorStyle"
import { StaticScreenProps } from "@react-navigation/native"
import { StackHeaderProps } from "@react-navigation/stack"
import { EventID } from "TiFShared/domain-models/Event"
import React from "react"
import { SafeAreaView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type AdventureHeaderProps = {
  title: string
  showBackButton: boolean
}

const AdventureHeader = ({
  title,
  showBackButton = true
}: AdventureHeaderProps) => {
  const insets = useSafeAreaInsets()
  const navigation = useTiFNavigation()

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View style={styles.leftContainer}>
          {showBackButton && navigation.canGoBack() && (
            <TouchableIonicon
              icon={{ name: "chevron-back", color: "white" }}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            ></TouchableIonicon>
          )}
        </View>

        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.rightContainer} />
      </View>
      <DashedLine
        style={styles.sawtoothEdges}
        dashStyle={{ transform: "rotate(45deg)" }}
        dashLength={16}
        dashThickness={16}
        dashGap={6}
        dashColor={AppStyles.primaryBlue.toString()}
      />
    </SafeAreaView>
  )
}

export const eventDetailsScreens = () => ({
  eventDetails: {
    options: () => ({
      headerTitle: "Adventure",
      headerStyle: {
        backgroundColor: AppStyles.primaryBlue.toString()
      },
      headerTintColor: "#fff",
      header: (
        props: Pick<StackHeaderProps, "options"> & AdventureHeaderProps
      ) => {
        const headerTitle = props.options.headerTitle?.toString() ?? "Screen"
        return <AdventureHeader {...props} title={headerTitle} />
      }
    }),
    screen: EventDetailsScreen
  },
  eventAttendeesList: {
    options: { headerTitle: "Attendees" },
    screen: AttendeesListScreen
  }
})

type AttendeesListScreenProps = StaticScreenProps<{ id: EventID }>

const AttendeesListScreen = ({ route }: AttendeesListScreenProps) => {
  const navigation = useTiFNavigation()
  useBackButton()
  return (
    <EventAttendeesListView
      state={useEventAttendeesList({ eventId: route.params.id })}
      onExploreOtherEventsTapped={() => navigation.navigate("home")}
    />
  )
}

type EventDetailsScreenProps = StaticScreenProps<{ id: EventID }>

const EventDetailsScreen = ({ route }: EventDetailsScreenProps) => {
  const navigation = useTiFNavigation()
  useBackButton()
  return (
    <EventDetailsContentView
      style={styles.eventDetails}
      result={useLoadEventDetails(route.params.id)}
      onExploreOtherEventsTapped={() => navigation.navigate("home")}
    >
      {(state) => <EventDetailsView state={state} />}
    </EventDetailsContentView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "white"
  },
  headerContainer: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: AppStyles.primaryBlue.toString(),
    borderBottomWidth: 1, // This adds the bottom border
    borderBottomColor: "#E0E0E0" // A light gray color for the border
  },
  sawtoothEdges: {
    right: 8,
    bottom: 8,
    width: "100%"
  },
  eventDetails: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  leftContainer: {
    position: "absolute",
    left: 16,
    zIndex: 1
  },
  rightContainer: {
    position: "absolute",
    right: 16,
    zIndex: 1
  },
  backButton: {
    padding: 0
  },
  backButtonText: {
    fontSize: 20
  }
})
