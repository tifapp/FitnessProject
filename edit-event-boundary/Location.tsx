import { useAtom } from "jotai"
import {
  ViewStyle,
  StyleProp,
  View,
  StyleSheet,
  LayoutRectangle,
  ActivityIndicator
} from "react-native"
import { editEventFormValueAtoms } from "./FormAtoms"
import {
  DEFAULT_GEOCODE_QUERY_OPTIONS,
  useGeocodeQuery,
  useReverseGeocodeQuery
} from "@location/Geocoding"
import React, { useEffect, useRef, useState } from "react"
import { TiFFormNavigationLinkView } from "@components/form-components/NavigationLink"
import { AppStyles } from "@lib/AppColorStyle"
import MapView, { Marker } from "react-native-maps"
import Animated, { FadeIn } from "react-native-reanimated"
import { TiFFormCardView } from "@components/form-components/Card"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { FontScaleFactors } from "@lib/Fonts"
import { AvatarMapMarkerView } from "@components/AvatarMapMarker"
import { EditEventFormLocation } from "@event/EditFormValues"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"

export const useEditEventFormLocation = () => {
  const [location, setLocation] = useAtom(editEventFormValueAtoms.location)
  const keyableLocation = location ?? {
    placemark: undefined,
    coordinate: undefined
  }
  const { data: geocodeData } = useGeocodeQuery(keyableLocation.placemark!, {
    ...DEFAULT_GEOCODE_QUERY_OPTIONS,
    enabled: !!location?.placemark && !location.coordinate
  })
  const { data: reverseGeocodeData } = useReverseGeocodeQuery(
    keyableLocation.coordinate!,
    {
      ...DEFAULT_GEOCODE_QUERY_OPTIONS,
      enabled: !!location?.coordinate && !location.placemark
    }
  )
  useEffect(() => {
    if (geocodeData) setLocation(geocodeData)
  }, [geocodeData, setLocation])
  useEffect(() => {
    if (reverseGeocodeData) setLocation(reverseGeocodeData)
  }, [reverseGeocodeData, setLocation])
  return location
}

export type EditEventFormLocationProps = {
  hostName: string
  hostProfileImageURL?: string
  location?: EditEventFormLocation
  onSelectLocationTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const EditEventFormLocationView = ({
  hostName,
  hostProfileImageURL,
  location,
  onSelectLocationTapped,
  style
}: EditEventFormLocationProps) => (
  <View style={style}>
    {!location ? (
      <TiFFormNavigationLinkView
        iconName="location"
        iconBackgroundColor={AppStyles.primary}
        title="No Location"
        description="You must select a location to create this event."
        style={styles.locationNavigationLink}
        chevronStyle={styles.locationNavigationLinkChevron}
        onTapped={onSelectLocationTapped}
      />
    ) : (
      <LocationView
        hostName={hostName}
        hostProfileImageURL={hostProfileImageURL}
        location={location}
        onSelectLocationTapped={onSelectLocationTapped}
      />
    )}
  </View>
)

type LocationProps = {
  hostName: string
  hostProfileImageURL?: string
  location: EditEventFormLocation
  onSelectLocationTapped: () => void
}

const LocationView = ({
  hostName,
  hostProfileImageURL,
  location,
  onSelectLocationTapped
}: LocationProps) => {
  const mapRef = useRef<MapView>(null)
  const [overlayLayout, setOverlayLayout] = useState<
    LayoutRectangle | undefined
  >(undefined)
  useEffect(() => {
    if (location.coordinate) {
      mapRef.current?.animateToRegion(mapRegion(location.coordinate))
    }
  }, [location.coordinate])
  const mapHeight = overlayLayout && Math.max(300, 200 + overlayLayout.height)
  return (
    <View style={styles.locationContainer}>
      {mapHeight && (
        <Animated.View entering={FadeIn.duration(300)}>
          {location.coordinate ? (
            <MapView
              style={[styles.mapDimensions, { height: mapHeight }]}
              loadingEnabled
              ref={mapRef}
              zoomEnabled={false}
              scrollEnabled={false}
              initialRegion={mapRegion(location.coordinate)}
              mapPadding={{
                top: 0,
                left: 0,
                right: 0,
                bottom: overlayLayout.height + 24
              }}
              customMapStyle={[
                {
                  featureType: "poi",
                  stylers: [{ visibility: "off" }]
                },
                {
                  featureType: "transit",
                  stylers: [{ visibility: "off" }]
                }
              ]}
            >
              <Marker coordinate={location.coordinate}>
                <AvatarMapMarkerView
                  name={hostName}
                  imageURL={hostProfileImageURL}
                />
              </Marker>
            </MapView>
          ) : (
            <View
              style={[
                styles.mapDimensions,
                styles.loadingMap,
                { height: mapHeight }
              ]}
            >
              <ActivityIndicator
                style={{ marginTop: (mapHeight - overlayLayout.height) / 2 }}
              />
            </View>
          )}
        </Animated.View>
      )}
      <View style={styles.overlayContainer}>
        <TiFFormCardView borderRadius={8} style={styles.overlay}>
          <View
            style={styles.overlayRow}
            onLayout={(event) => setOverlayLayout(event.nativeEvent.layout)}
          >
            {!location.placemark ? (
              <TiFFormNavigationLinkView
                iconName="location"
                iconBackgroundColor={AppStyles.primary}
                maximumFontScaleFactor={FontScaleFactors.xxxLarge}
                style={styles.locationMapNavigationLink}
                title={`${location.coordinate.latitude}, ${location.coordinate.longitude}`}
                onTapped={onSelectLocationTapped}
              />
            ) : (
              <TiFFormNavigationLinkView
                iconName="location"
                iconBackgroundColor={AppStyles.primary}
                style={styles.locationMapNavigationLink}
                title={location.placemark.name ?? "Unknown Location"}
                maximumFontScaleFactor={FontScaleFactors.xxxLarge}
                description={
                  placemarkToFormattedAddress(location.placemark) ??
                  "Unknown Address"
                }
                onTapped={onSelectLocationTapped}
              />
            )}
          </View>
        </TiFFormCardView>
      </View>
    </View>
  )
}

const mapRegion = (coordinate: LocationCoordinate2D) => ({
  ...coordinate,
  latitudeDelta: 0.07,
  longitudeDelta: 0.07
})

const styles = StyleSheet.create({
  locationNavigationLink: {
    width: "100%",
    borderStyle: "dashed",
    borderRadius: 12,
    borderColor: AppStyles.primaryColor,
    borderWidth: 2
  },
  locationNavigationLinkChevron: {
    opacity: 1
  },
  locationMapNavigationLink: {
    width: "100%"
  },
  mapDimensions: {
    width: "100%",
    borderRadius: 12
  },
  locationContainer: {
    height: 300
  },
  loadingMap: {
    backgroundColor: AppStyles.colorOpacity15
  },
  overlayContainer: {
    paddingHorizontal: 16
  },
  overlay: {
    position: "absolute",
    bottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "white",
    width: "100%",
    padding: 4
  },
  overlayRow: {
    display: "flex",
    flexDirection: "row"
  }
})
