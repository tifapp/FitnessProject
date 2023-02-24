import React, { useEffect, useState } from "react";
import { Button, StyleProp, View, ViewStyle } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

//Type for the map markers, in order to separate their logic out
type mapMarker = {
  key: number,
  place: string,
  lat: number,
  lng: number,
  pinColor: string
  isSelected: boolean
};

interface Props {
  //Contain style specifically for style on container for map
  //Map style specifically for style on map
  containStyle?: StyleProp<ViewStyle>;
  mapStyle?: StyleProp<ViewStyle>;

  initialRegion: {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
  }

  markers: mapMarker[];

  movementSettings: {
  canScroll: boolean,
  canZoom: boolean,
  canRotate: boolean,
  };
}



// Map view component itself
function MapComponent ({initialRegion, markers, containStyle, mapStyle, movementSettings}: Props) {
  //Map references
  const mapRef = React.useRef(null);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [currentMarkers, setCurrentMarkers] = useState(markers.map((item) => ({ ...item, isSelected: false})));

  useEffect(() => {
    setCurrentMarkers(markers)
  }, [markers])
  
  const mapMarkerCreations = () => {
  return currentMarkers.map((marker) => {
    <Marker
    key = {marker.key}
    title = {marker.place}
    coordinate = {{ latitude: marker.lat, longitude: marker.lng }}
    pinColor = {marker.pinColor}
    onPress={() => {onMarkerClick(marker.lat, marker.lng); onSelected(marker);}}
    />
  }
    )
  }

  function onMarkerClick (lat: number, long: number) {
    mapRef.current.animateToRegion({
      latitude: lat,
      longitude: long,
      latitudeDelta: initialRegion.latitudeDelta - 0.02,
      longitudeDelta: initialRegion.longitudeDelta - 0.02,
    })
    
  }

  function onRecenter () {
    mapRef.current.animateToRegion({
      latitude: initialRegion.latitude,
      longitude: initialRegion.longitude,
      latitudeDelta: initialRegion.latitudeDelta,
      longitudeDelta: initialRegion.longitudeDelta,
    })
  }

  //From robinwieruch.de
  function onSelected (given: mapMarker) {
    const newMarkers = markers.map((item) => {
      if (item.key === given.key) {
        const newItem = {
          ...item,
          isSelected: true,
        };
        return newItem;
      }
      return item;
    });
    setCurrentMarkers(newMarkers);
  }

  return (
    <View style={containStyle}>
      <MapView
          style={mapStyle}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          ref={mapRef}
          rotateEnabled={movementSettings.canRotate}
          scrollEnabled={movementSettings.canScroll}
          followsUserLocation={true}
          showsUserLocation={true}
          zoomEnabled={movementSettings.canZoom}
          customMapStyle={[
            {
              "featureType": "poi",
              "stylers": [{ "visibility": "off" }]
            },{
              "featureType": "transit",
              "stylers": [{ "visibility": "off" }]
            }
          ]}
          onPress={(e) => {
            if (e.nativeEvent.action != 'marker-press')
              
          }}
      >
      {mapMarkerCreations()}
      </MapView>
      <View
        style={{
        position: 'absolute',//use absolute position to show button on top of the map
        top: '70%', //for center align
        alignSelf: 'flex-end' //for align to right
        }}
      >
      { 
        !!buttonVisible &&
        <Button title="Re-Center" onPress={() => {onRecenter(); setButtonVisible(false);}}/>
      }
      </View>

      {<View
        style={{
        position: 'absolute',//use absolute position to show button on top of the map
        top: '80%', //for center align
        alignSelf: 'flex-end' //for align to right
        }}
      >
      </View>}

    </View>
  )
}

//

export default MapComponent
