import { AvatarMapMarkerView } from "@components/AvatarMapMarker"
import { Ionicon } from "@components/common/Icons"
import { TiFFormNavigationLinkView } from "@components/form-components/NavigationLink"
import { ExpandableMapSnippetView } from "@components/MapSnippetView"
import { Caption, Footnote } from "@components/Text"
import { EditEventFormLocation } from "@event/EditFormValues"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors } from "@lib/Fonts"
import React, { useEffect, useRef, useState } from "react"
import {
  StyleSheet,
  View
} from "react-native"
import MapView, { LongPressEvent } from "react-native-maps"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { EditEventProps } from "./EditEvent"
import { useEditEventFormLocation } from "./Location"

type LocationProps = {
  hostName: string
  hostProfileImageURL?: string
  location: EditEventFormLocation
  onSelectLocationTapped: () => void
  onMapLongPress: (event: LongPressEvent) => void
  isExpanded?: boolean;
}

const mapRegion = (coordinate: LocationCoordinate2D) => ({
  ...coordinate,
  latitudeDelta: 0.07,
  longitudeDelta: 0.07
})

const LocationView = ({
  hostName,
  hostProfileImageURL,
  location,
  onSelectLocationTapped,
  onMapLongPress,
  isExpanded
}: LocationProps) => {
  const mapRef = useRef<MapView>(null)
  useEffect(() => {
    if (location.coordinate) {
      mapRef.current?.animateToRegion(mapRegion(location.coordinate))
    }
  }, [location.coordinate])
  return (
    <View>
    <ExpandableMapSnippetView
      ref={mapRef}
      isExpanded={isExpanded ?? false}
      onExpansionChanged={() => {}}
      region={mapRegion(location.coordinate ?? { latitude: 0, longitude: 0 })}
      expandedMapProps={{
        onLongPress: onMapLongPress,
        showsUserLocation: true
      }}
      marker={
        <AvatarMapMarkerView
          name={hostName}
          imageURL={hostProfileImageURL}
        />
      }
      overlay={(isExpanding) => {
        return (
          <View style={styles.container}>
            {(
              <View style={styles.instructionContainer}>
                <Ionicon
                  name="pin-sharp"
                  size={24}
                  style={styles.instructionIcon}
                  color="black"
                />
                <Footnote style={styles.instructionText}>
                  {
                    "Tap and hold anywhere on the map to select a new location."
                  }
                </Footnote>
              </View>
            )}
            {!location.placemark ? (
              <View style={styles.overlayContainer}>
                <Caption style={styles.currentLocation}>
                  {"Current Location"}
                </Caption>
                <TiFFormNavigationLinkView
                  iconName="location"
                  iconBackgroundColor={AppStyles.primary}
                  maximumFontScaleFactor={FontScaleFactors.xxxLarge}
                  style={styles.locationMapNavigationLink}
                  title={`${location.coordinate.latitude}, ${location.coordinate.longitude}`}
                  onTapped={() => {
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
                    onSelectLocationTapped()
                  }}
                />
              </View>
            )}
          </View>
        )
      }}
    />
      <View style={styles.overlayContainer}>
        {!location.placemark ? (
          <TiFFormNavigationLinkView
            iconName="location"
            iconBackgroundColor={AppStyles.primary}
            maximumFontScaleFactor={FontScaleFactors.xxxLarge}
            style={styles.locationMapNavigationLink}
            title={`${location.coordinate.latitude}, ${location.coordinate.longitude}`}
            onTapped={() => {
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
              onSelectLocationTapped()
            }}
          />
        )}
      </View>
    </View>
  )
}

export const CreateEventView = ({
  hostName,
  hostProfileImageURL,
  eventId,
  currentDate = new Date(),
  onSelectLocationTapped,
  onSuccess,
  initialValues,
  style
}: EditEventProps) => {
  const [title, setTitle] = useState<string>()

  return (
    <View style={{ backgroundColor: "black", flex: 1 }}>
    <LocationView
      hostName={hostName}
      location={useEditEventFormLocation() ?? { placemark: {}, coordinate: { latitude: 0, longitude: 0 } }}
      onSelectLocationTapped={function (): void {
        throw new Error("Function not implemented.")
      }}
      onMapLongPress={function (event: LongPressEvent): void {
        throw new Error("Function not implemented.")
      }}
    />
      <View style={{ height: "60%" }}>
        {/* <TelescopeInput onSubmit={setTitle} /> */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1
  },
  footer: {
    position: "absolute",
    width: "100%",
    flex: 1,
    backgroundColor: "white",
    bottom: 0,
    paddingHorizontal: 24
  },
  startDateRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16
  },
  startDateRowItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 128,
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: AppStyles.cardColor
  },
  sheetHandle: {
    opacity: 0
  },
  bottomSheetView: {
    rowGap: 16,
    paddingHorizontal: 24
  },
  bottonSheetTopRow: {
    display: "flex",
    flexDirection: "row"
  },
  bottomSheetTopRowSpacer: {
    flex: 1
  },
  durationPickerSheetStyle: {
    paddingBottom: 24
  },
  durationPicker: {
    width: "100%",
    alignSelf: "center",
    height: 256
  },
  eventTimeRangeRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 16
  },
  eventTimeRangeLabel: {
    marginRight: 16
  },
  eventTimeRangeText: {
    flex: 1
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
