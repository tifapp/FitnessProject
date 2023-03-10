import React, { createContext, useContext, useState } from "react"
import EventsList from "@components/EventsList"
import { View } from "react-native"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

const ActivitiesScreen = () => {
  /* function signOut () {
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
  } */

  return <EventsList />
}

export default ActivitiesScreen
