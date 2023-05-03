import Map, { MapMarker } from "@components/eventMap/EventsMap"
import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { View } from "react-native"

const testMapMarker = {
  key: "test",
  location: { latitude: 41.1234, longitude: -121.1234 },
  name: "Test Marker"
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

interface TestMapMarker extends MapMarker {
  name: string
}

const renderMap = (markers: TestMapMarker[]) => {
  return render(
    <Map
      markers={markers}
      initialRegion={{
        ...testMapMarker.location,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2
      }}
      renderMarker={(marker: TestMapMarker) => <View testID={marker.name} />}
      onMarkerSelected={selectionEvent}
    />
  )
}
