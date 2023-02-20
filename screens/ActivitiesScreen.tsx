import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import EventsList from "@components/EventsList"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import DateTimePicker from "@components/formComponents/DateTimePicker"

const ActivitiesScreen = () => {
  const [date, setDate] = useState(new Date())
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableOpacity onPress={signOut}>
        <Text
          style={{
            fontSize: 15,
            margin: 20
          }}
        >
          Log Out
        </Text>
        <Text
          style={{
            alignItems: "center",
            justifyContent: "center",
            color: "black",
            fontWeight: "bold",
            fontSize: 15
          }}
        >
          SandBox to get started
        </Text>
      </TouchableOpacity>
      <DateTimePicker
        style={{ paddingHorizontal: 24 }}
        textStyle={{ fontWeight: "bold" }}
        label="Pick Date"
        date={date}
        onDateChanged={setDate}
      />
    </GestureHandlerRootView>
  )
}

export default ActivitiesScreen
