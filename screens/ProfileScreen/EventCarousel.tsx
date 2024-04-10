import { ClientSideEvent } from "@event/ClientSideEvent"
import React from "react"
import { Dimensions, StyleSheet, View } from "react-native"

interface EventPagerProps {
  events: ClientSideEvent[]
}

const EventCarousel = ({ events }: EventPagerProps) => {
  const height = 280 // Need to set a fixed height
  const width = Dimensions.get("window").width

  return <View style={styles.container}></View>
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 80
  }
})

export default EventCarousel
