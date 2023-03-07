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
import { EventFormTestScreen } from "./testScreens/EventFormTestScreen"

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
  
  return <EventFormTestScreen />
}

export default ActivitiesScreen
