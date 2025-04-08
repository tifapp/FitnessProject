import { useBackButton, useTiFNavigation } from "@components/Navigation"
import {
  EventAttendeesListView,
  useEventAttendeesList
} from "@event-details-boundary/AttendeesList"
import { EventDetailsContentView } from "@event-details-boundary/Content"
import { EventDetailsView } from "@event-details-boundary/Details"
import { useLoadEventDetails } from "@event/DetailsQuery"
import { AppStyles } from "@lib/AppColorStyle"
import { StaticScreenProps } from "@react-navigation/native"
import { EventID } from "TiFShared/domain-models/Event"
import React from "react"
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"

const AdventureHeader = ({ title, showBackButton = true }) => {
  const navigation = useTiFNavigation()

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.leftContainer}>
          {showBackButton && navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.headerTitle}>{title}</Text>

        <View style={styles.rightContainer} />
      </View>
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
      headerTintColor: "#fff"
      // header: (props) => <AdventureHeader {...props} />
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
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1, // This adds the bottom border
    borderBottomColor: "#E0E0E0" // A light gray color for the border
  },
  headerTitle: {
    fontSize: 18,
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
    padding: 8
  },
  backButtonText: {
    fontSize: 20
  }
})
