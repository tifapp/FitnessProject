import React, { useEffect, useState } from "react"
import { FlatList } from "react-native-gesture-handler"
import EventItem from "@components/EventItem"
import NearbyActivities from "./headerComponents/NearbyActivities"
import { ListRenderItemInfo } from "react-native"
import { Event } from "@lib/events/Event"

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([])

  const date = new Date()
  const event: Event = {
    id: "5462426",
    userId: "3234324",
    repliesCount: 2,
    writtenByYou: true,
    startTime: date,
    maxOccupancy: 5,
    hasInvitations: true,
    color: "magenta",
    title: "Title for Event"
  }

  useEffect(() => {
    const test = []
    test.push(event)
    setEvents(test)
  }, [])

  return (
    <FlatList
      data={events}
      renderItem={({ item }: ListRenderItemInfo<Event>) => (
        <EventItem event={item} />
      )}
      ListHeaderComponent={<NearbyActivities />}
      stickyHeaderIndices={[0]}
    />
  )
}

export default EventsList
