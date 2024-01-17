import React, { useState } from "react"
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  Dimensions,
  View
} from "react-native"
import Carousel from "react-native-reanimated-carousel"
import { CurrentUserEvent } from "@shared-models/Event"
import { EventCard } from "@event-details/EventCard"

interface EventPagerProps {
  events: CurrentUserEvent[]
}

const EventCarousel = ({ events }: EventPagerProps) => {
  const height = 280 // Need to set a fixed height
  const width = Dimensions.get("window").width

  return (
    <View style={styles.container}>
      <Carousel
        loop={false}
        data={events}
        renderItem={({ item }) => (
          <EventCard event={item} style={{ height: "100%" }} />
        )}
        width={width}
        height={height}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.85,
          parallaxScrollingOffset: 80,
          parallaxAdjacentItemScale: 0.7
        }}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10]
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 80
  }
})

export default EventCarousel
