import Map, { MapCircleProps, MapMarker } from "@components/Map"
import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { View } from "react-native"
import "../helpers/Matchers"

interface TestMapMarker extends MapMarker {
  name: string
}

const testMapMarker = {
  key: "test",
  location: { latitude: 41.1234, longitude: -121.1234 },
  name: "Test Marker"
} as const

describe("Map tests", () => {
  it("forwards marker selection events", () => {
    renderMap([testMapMarker])
    selectMarker(testMapMarker.name)
    expect(selectionEvent).toHaveBeenCalledWith(testMapMarker)
  })

  it("shows circles for markers when marker indicates that it should show a circle", () => {
    const noCircleMarker = { ...testMapMarker, key: "show" }
    renderMap([testMapMarker, noCircleMarker], (marker: TestMapMarker) => {
      if (marker.key === noCircleMarker.key) return { show: false }
      return { show: true, options: { radiusMeters: 50 } }
    })

    expect(markerCircle(testMapMarker)).toBeDisplayed()
    expect(markerCircle(noCircleMarker)).not.toBeDisplayed()
  })
})

const selectionEvent = jest.fn()

const selectMarker = (markerName: string) => {
  fireEvent.press(screen.getByTestId(markerName))
}

const markerCircle = (marker: TestMapMarker) => {
  return screen.queryByTestId(`mapCircle-${marker.key}`)
}

const renderMap = (
  markers: TestMapMarker[],
  circleForMarker?: (marker: TestMapMarker) => MapCircleProps
) => {
  return render(
    <Map
      markers={markers}
      initialRegion={{
        ...testMapMarker.location,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2
      }}
      renderMarker={(marker: TestMapMarker) => <View testID={marker.name} />}
      circleForMarker={circleForMarker}
      onMarkerSelected={selectionEvent}
    />
  )
}
