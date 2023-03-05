import { EventForm, EventFormToolbar } from "@components/eventForm"
import { dateRange } from "@lib/date"
import { SetDependencyValue } from "@lib/dependencies"
import { EventColors } from "@lib/events/EventColors"
import { Geocoding, geocodingDependencyKey } from "@lib/location"
import { Auth } from "aws-amplify"
import React from "react"
import { Alert, Text, TouchableOpacity } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { QueryClient, QueryClientProvider } from "react-query"
import EventFormScreen from "./EventFormScreen"

const queryClient = new QueryClient()

const ActivitiesScreen = () => {
  function signOut () {
    const title = "Are you sure you want to sign out?"
    const message = ""
    Alert.alert(
      title,
      message,
      [
        {
          text: "Yes",
          onPress: () => {
            Auth.signOut()
          }
        }, // if submithandler fails user won't know
        { text: "Cancel", style: "cancel" }
      ],
      { cancelable: true }
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SetDependencyValue
        forKey={geocodingDependencyKey}
        value={
          {
            reverseGeocode: async () => {
              throw new Error()
            }
          } as unknown as Geocoding
        }
      >
        <EventFormScreen
          initialValues={{
            title: "Test",
            description: "Hello world this is a test.",
            color: EventColors.Red,
            dateRange: dateRange(
              new Date("2023-03-02T08:00:00"),
              new Date("2023-03-02T09:00:00")
            ),
            radiusMeters: 0,
            locationInfo: {
              coordinates: { latitude: 41.234, longitude: -121.123 },
              placemarkInfo: {
                name: "Test Location",
                address: "1234 Test Dr, Test City, CA 12345"
              }
            },
            shouldHideAfterStartDate: false
          }}
          submissionLabel="Save Event"
          onDismiss={() => Alert.alert("Dismissed")}
          onSubmit={async () => Alert.alert("Submitted")}
        />
      </SetDependencyValue>
    </QueryClientProvider>
  )
}

export default ActivitiesScreen
