import { useAtom } from "jotai"
import {
  ViewStyle,
  StyleProp,
  View,
  StyleSheet,
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
import MapView from "react-native-maps"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { FontScaleFactors } from "@lib/Fonts"
import { AvatarMapMarkerView } from "@components/AvatarMapMarker"
import { EditEventFormLocation } from "@event/EditFormValues"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { ExpandableMapSnippetView } from "@components/MapSnippetView"
import { TiFFormCardView } from "@components/form-components/Card"

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
  useEffect(() => {
    if (location.coordinate) {
      mapRef.current?.animateToRegion(mapRegion(location.coordinate))
    }
  }, [location.coordinate])
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <View>
      {location.coordinate ? (
        <ExpandableMapSnippetView
          ref={mapRef}
          isExpanded={isExpanded}
          onExpansionChanged={setIsExpanded}
          region={mapRegion(location.coordinate)}
          collapsedMapProps={{
            customMapStyle: [
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "transit",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
          expandedMapProps={{ showsUserLocation: true }}
          marker={
            <AvatarMapMarkerView
              name={hostName}
              imageURL={hostProfileImageURL}
            />
          }
          overlay={
            <View style={styles.overlayContainer}>
              {!location.placemark ? (
                <TiFFormNavigationLinkView
                  iconName="location"
                  iconBackgroundColor={AppStyles.primary}
                  maximumFontScaleFactor={FontScaleFactors.xxxLarge}
                  style={styles.locationMapNavigationLink}
                  title={`${location.coordinate.latitude}, ${location.coordinate.longitude}`}
                  onTapped={() => {
                    setIsExpanded(false)
                    onSelectLocationTapped()
                  }}
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
                  onTapped={() => {
                    setIsExpanded(false)
                    onSelectLocationTapped()
                  }}
                />
              )}
            </View>
          }
        />
      ) : (
        <View style={[styles.mapDimensions, styles.loadingMap]}>
          <ActivityIndicator />
        </View>
      )}
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
    borderRadius: 12,
    overflow: "hidden"
  },
  locationContainer: {
    height: 300
  },
  loadingMap: {
    height: 300,
    backgroundColor: AppStyles.colorOpacity15
  },
  overlayContainer: {
    borderRadius: 12,
    backgroundColor: "white",
    overflow: "hidden"
  },
  overlay: {
    position: "absolute",
    bottom: 16,
    marginHorizontal: 16,
    backgroundColor: "white",
    width: "100%",
    padding: 4
  },
  overlayRow: {
    display: "flex",
    flexDirection: "row"
  }
})
