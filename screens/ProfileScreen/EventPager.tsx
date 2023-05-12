import React from "react"
import {
  StyleSheet,
  View,
  Text,
  StyleProp,
  ViewStyle,
  Animated
} from "react-native"
import PagerView from "react-native-pager-view"
import { CurrentUserEvent } from "@lib/events"
import { EventCard } from "@components/eventCard/EventCard"

interface EventPagerProps {
  events: CurrentUserEvent[]
  style?: StyleProp<ViewStyle>
}

const EventPager = ({ events, style }: EventPagerProps) => {
  return (
    <View style={styles.container}>
      <PagerView style={[styles.pageContainer, style]} initialPage={0}>
        {events.map((event, index) => (
          <EventCard event={event} style={styles.page} key={index} />
        ))}
      </PagerView>
    </View>
  )
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    maxHeight: 270
  },
  page: {
    justifyContent: "flex-start",
    alignItems: "flex-start"
  },
  container: {
    height: 270,
    flex: 1
  }
})

export default EventPager
