import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { EventMarker, EventsMap } from "../../components/eventMap/EventsMap"

const testEvents: TestMapMarker[] = [
  {
    id: "test",
    coordinates: { latitude: 41.1234, longitude: -121.1234 },
    attendeeCount: 19,
    color: "red",
    hostID: "bruh",
    name: "Test1"
  }
]

describe("Map tests", () => {
  it("forwards marker selection events", () => {
    renderMap(testEvents)
    selectMarker(testEvents[0].name)
    expect(selectionEvent).toHaveBeenCalledWith(testEvents)
  })
})

const selectionEvent = jest.fn()

const selectMarker = (markerName: string) => {
  fireEvent.press(screen.getByTestId(markerName))
}

interface TestMapMarker extends EventMarker {
  name: string
}

const renderMap = (markers: TestMapMarker[]) => {
  return render(
    <EventsMap
      ref={undefined}
      style={{ width: "100%", height: "100%" }}
      initialRegion={{
        ...testEvents[0].coordinates,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2
      }}
      markers={markers.map((event: TestMapMarker) => ({
        id: event.id,
        coordinates: event.coordinates,
        attendeeCount: event.attendeeCount,
        color: event.color,
        hostID: event.hostID
      }))}
      onMarkerSelected={selectionEvent}
    />
  )
}
