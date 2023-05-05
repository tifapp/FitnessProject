import { EventMarker, EventsMap } from "@components/eventMap/EventsMap"
import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"

const testMapMarker = {
  id: "test",
  coordinates: { latitude: 41.1234, longitude: -121.1234 },
  attendeeCount: 19,
  color: "red",
  hostID: "bruh",
  name: "Test1"
}

describe("Map tests", () => {
  it("forwards marker selection events", () => {
    renderMap([testMapMarker])
    selectMarker(testMapMarker.name)
    expect(selectionEvent).toHaveBeenCalledWith(testMapMarker)
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
      markers={[
        {
          id: testMapMarker.id,
          coordinates: testMapMarker.coordinates,
          attendeeCount: 19,
          color: "red",
          hostID: "bruh"
        }
      ]}
      initialRegion={{
        ...testMapMarker.coordinates,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2
      }}
      onMarkerSelected={selectionEvent}
    />
  )
}
