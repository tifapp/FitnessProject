import React, { useState } from "react";
import { Button, StyleProp, View, ViewStyle } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

interface Props {
  containStyle?: StyleProp<ViewStyle>;
  mapStyle?: StyleProp<ViewStyle>;
  initialRegion: {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
  }
  markers: {
  key: number,
  place: string,
  lat: number,
  lng: number,
  pinColor: string
  }[];
  movementSettings: {
  canScroll: boolean,
  canZoom: boolean,
  canRotate: boolean,
  };
}

// Map view component itself
function MapComponent ({initialRegion, markers, containStyle, mapStyle, movementSettings}: Props) {
  const mapRef = React.useRef(null);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<Object>();
  const [currentMarkers, setCurrentMarkers] = useState(markers);

  /*const onLongPress = () => {
    setCurrentMarkers([...currentMarkers, e.nativeEvent.coordinate]);
  }*/
  
  const mapMarkerCreations = () => {
  return markers.map((report) =>
    <Marker
    key = {report.key}
    title = {report.place}
    coordinate = {{ latitude: report.lat, longitude: report.lng }}
    pinColor = {report.pinColor}
    onPress={() => {onMarkerClick(report.lat, report.lng); setButtonVisible(true); setSelectedMarker(report)}}
    icon={require('../assets/icon.png')}
    >
    </Marker >)
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
        buttonVisible == true &&
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
      {
        selectedMarker &&
        <Button title="Deselect" onPress={() => setSelectedMarker(undefined)}/>  
      }
      </View>}

    </View>
  )
}

//

export default MapComponent
