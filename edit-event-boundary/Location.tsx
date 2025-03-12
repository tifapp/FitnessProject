import { ReticleMapSnippetView } from "@components/ReticleMapSnippetView"
import { Caption } from "@components/Text"
import { TiFFormNavigationLinkView } from "@components/form-components/NavigationLink"
import { EditEventFormLocation } from "@event/EditFormValues"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors } from "@lib/Fonts"
import {
  DEFAULT_GEOCODE_QUERY_OPTIONS,
  useGeocodeQuery,
  useReverseGeocodeQuery
} from "@location/Geocoding"
import { useUserCoordinatesQuery } from "@location/UserLocation"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { LocationAccuracy } from "expo-location"
import { useAtom } from "jotai"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import MapView, { LongPressEvent } from "react-native-maps"
import { editEventFormValueAtoms } from "./FormAtoms"

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
  onMapLongPress: (event: LongPressEvent) => void
  style?: StyleProp<ViewStyle>
}

type LocationProps = {
  hostName: string
  hostProfileImageURL?: string
  location?: EditEventFormLocation
  onSelectLocationTapped: () => void
  onMapLongPress: (event: LongPressEvent) => void
  isExpanded?: boolean
}

export const EditEventFormLocationView = ({
  isExpanded = false,
  hostName,
  hostProfileImageURL,
  location,
  onSelectLocationTapped,
  onMapLongPress
}: LocationProps) => {
  const { data } = useUserCoordinatesQuery(
    { accuracy: LocationAccuracy.BestForNavigation },
    { enabled: true }
  )

  const mapRef = useRef<MapView>(null)

  const coords = location?.coordinate ?? data?.coords ?? { latitude: 0, longitude: 0 }

  useEffect(() => {
    mapRef.current?.animateToRegion(mapRegion(coords))
  }, [coords])

  const [isExpandedInternal, setIsExpandedInternal] = useState(isExpanded)

  return (
    <View>
      {coords ? (
        <ReticleMapSnippetView
          ref={mapRef}
          isExpanded={isExpandedInternal}
          onExpansionChanged={setIsExpandedInternal}
          region={mapRegion(coords)}
          expandedMapProps={{
            onLongPress: onMapLongPress,
            showsUserLocation: true
          }}
          marker={undefined}
          overlay={(isExpanding) => {
            return (
              <View style={styles.container}>
                {!location?.placemark ? (
                  <View style={styles.overlayContainer}>
                    <Caption style={styles.currentLocation}>
                      {"Current Location"}
                    </Caption>
                    <TiFFormNavigationLinkView
                      iconName="location"
                      iconBackgroundColor={AppStyles.primary}
                      maximumFontScaleFactor={FontScaleFactors.xxxLarge}
                      style={styles.locationMapNavigationLink}
                      title={`${coords.latitude}, ${coords.longitude}`}
                      onTapped={() => {
                        setIsExpandedInternal(false)
                        onSelectLocationTapped()
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.overlayContainer}>
                    <Caption style={styles.currentLocation}>
                      {"Current Location"}
                    </Caption>
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
                        setIsExpandedInternal(false)
                        onSelectLocationTapped()
                      }}
                    />
                  </View>
                )}
              </View>
            )
          }}
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
  container: {
    rowGap: 16
  },
  currentLocation: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  instructionContainer: {
    borderRadius: 12,
    backgroundColor: "white",
    overflow: "hidden",
    padding: 16,
    flex: 1,
    alignItems: "center",
    columnGap: 16,
    flexDirection: "row"
  },
  instructionIcon: {
    marginLeft: 8
  },
  instructionText: {
    flex: 1
  },
  locationNavigationLink: {
    width: "100%",
    borderStyle: "dashed",
    borderRadius: 128,
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
    borderRadius: 128,
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
