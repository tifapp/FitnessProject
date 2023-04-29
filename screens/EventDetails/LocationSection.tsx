import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import * as Clipboard from "expo-clipboard"
import { Headline, Caption, CaptionTitle } from "@components/Text"
import {
  LocationCoordinate2D,
  Placemark,
  placemarkToFormattedAddress
} from "@lib/location"
import { useTrackUserLocation } from "@hooks/UserLocation"
import { EventMapDetails, withDirections } from "@lib/ExternalMap"
import { ButtonStyles, showToast } from "@lib/ButtonStyle"
import { Ionicon } from "@components/common/Icons"

interface LocationSectionProps {
  color: string
  placemark?: Placemark
  coordinates: LocationCoordinate2D,
  bottomTabHeight: number
}

const LocationSection = ({
  color,
  placemark,
  coordinates,
  bottomTabHeight
}: LocationSectionProps) => {
  const userLocation = useTrackUserLocation("precise")
  
  const mapDetails: EventMapDetails = {
    coordinates: coordinates,
    placemark: placemark
  }

  const hitSlopInset = {
    top: 10,
    bottom: 10,
    right: 10,
    left: 10
  }

  const openMapWithDirections = async () => {
    await withDirections(userLocation, mapDetails)
  }

  const copyToClipboard = async () => {
    if (placemark) {
      await Clipboard.setStringAsync(placemarkToFormattedAddress(placemark)!)
    } else {
      await Clipboard.setStringAsync(
        `${coordinates.latitude}, ${coordinates.longitude}`
      )
    }
    showToast("Copied to Clipboard", bottomTabHeight)
  }

  return (
    <View style={[styles.flexRow, styles.paddingIconSection]}>
      <View style={{ justifyContent: "center" }}>
        <Ionicon 
          style={[styles.iconStyling, { backgroundColor: color }]}
          name="location"
          color={"white"}
        />
      </View>
      {placemark
        ? (
          <View style={styles.spacing}>
            <View style={{ marginBottom: 4 }}>
              <Headline style={styles.textColor}>{placemark.name}</Headline>
              <View style={styles.flexRow}>
                {placemark.streetNumber && (
                  <Caption>{`${placemark.streetNumber} `}</Caption>
                )}
                {placemark.street && <Caption>{`${placemark.street}, `}</Caption>}
                {placemark.city && <Caption>{`${placemark.city}, `}</Caption>}
                {placemark.region && <Caption>{`${placemark.region}`}</Caption>}
              </View>
            </View>
            <View style={styles.flexRow}>
              <TouchableOpacity onPress={copyToClipboard} hitSlop={hitSlopInset}>
                <CaptionTitle
                  style={[{ color, marginRight: 16 }, styles.captionLinks]}
                  
                >
                Copy Address
                </CaptionTitle>
              </TouchableOpacity>
              <TouchableOpacity onPress={openMapWithDirections} hitSlop={hitSlopInset}>
                <CaptionTitle style={[{ color }, styles.captionLinks]}>
                Directions
                </CaptionTitle>
              </TouchableOpacity>
            </View>
          </View>
        )
        : (
          <View style={styles.spacing}>
            <View style={{ marginBottom: 4 }}>
              <Headline>{`${coordinates.latitude}, ${coordinates.longitude}`}</Headline>
              <View style={styles.flexRow}>
                <Caption>Unknown Address</Caption>
              </View>
            </View>
            <View style={styles.flexRow}>
              <TouchableOpacity onPress={copyToClipboard} hitSlop={hitSlopInset}>
                <CaptionTitle
                  style={[{ color, marginRight: 16 }, styles.captionLinks]}
                >
                Copy Coordinates
                </CaptionTitle>
              </TouchableOpacity>
              <TouchableOpacity onPress={openMapWithDirections} hitSlop={hitSlopInset}>
                <CaptionTitle style={[{ color }, styles.captionLinks]}>
                Directions
                </CaptionTitle>
              </TouchableOpacity>
            </View>
          </View>
        )}
    </View>
  )
}

export default LocationSection

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row"
  },
  paddingIconSection: {
    paddingHorizontal: 16
  },
  iconStyling: {
    padding: 6,
    borderRadius: 12
  },
  spacing: {
    paddingHorizontal: 16
  },
  captionLinks: {
    opacity: 1,
    fontWeight: "bold"
  },
  textColor: {
    color: ButtonStyles.darkColor
  }
})
