import React, { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import * as Clipboard from "expo-clipboard"
import { Headline, Caption, CaptionTitle } from "@components/Text"
import {
  LocationCoordinate2D,
  Placemark,
  placemarkToFormattedAddress
} from "@lib/location"
import { OpenInMapsOptions, openInMapWithDirections } from "@lib/OpenInMaps"
import { Ionicon } from "@components/common/Icons"
import { showToast } from "@components/common/Toasts"
import { Divider } from "react-native-elements"

interface LocationSectionProps {
  color: string
  placemark?: Placemark
  coordinates: LocationCoordinate2D
}

const LocationSection = ({
  color,
  placemark,
  coordinates
}: LocationSectionProps) => {
  const [dividerWidth, setDividerWidth] = useState(0)

  const mapDetails: OpenInMapsOptions = {
    coordinates,
    placemark
  }

  const hitSlopInset = {
    top: 10,
    bottom: 10,
    right: 10,
    left: 10
  }

  const openMapWithDirections = async () => {
    await openInMapWithDirections(mapDetails)
  }

  const copyToClipboard = async () => {
    if (placemark) {
      await Clipboard.setStringAsync(placemarkToFormattedAddress(placemark)!)
    } else {
      await Clipboard.setStringAsync(
        `${coordinates.latitude}, ${coordinates.longitude}`
      )
    }
    showToast("Copied to Clipboard")
  }

  const onLayout = (e: { nativeEvent: { layout: { width: any } } }) => {
    setDividerWidth(e.nativeEvent.layout.width)
  }

  return (
    <View>
      <View style={[styles.flexRow, styles.paddingIconSection]}>
        <View style={[styles.iconStyling, { backgroundColor: color }]}>
          <Ionicon name="location" color={"white"} />
        </View>
        {placemark
          ? (
            <View style={styles.spacing} onLayout={onLayout}>
              <View style={{ marginBottom: 4 }}>
                <Headline>{placemark.name}</Headline>
                <View style={styles.flexRow}>
                  {placemark.streetNumber && (
                    <Caption>{`${placemark.streetNumber} `}</Caption>
                  )}
                  {placemark.street && (
                    <Caption>{`${placemark.street}, `}</Caption>
                  )}
                  {placemark.city && <Caption>{`${placemark.city}, `}</Caption>}
                  {placemark.region && <Caption>{`${placemark.region}`}</Caption>}
                </View>
              </View>
              <View style={styles.flexRow}>
                <TouchableOpacity
                  onPress={copyToClipboard}
                  hitSlop={hitSlopInset}
                >
                  <CaptionTitle
                    style={[{ color, marginRight: 16 }, styles.captionLinks]}
                  >
                  Copy Address
                  </CaptionTitle>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openMapWithDirections}
                  hitSlop={hitSlopInset}
                >
                  <CaptionTitle style={[{ color }, styles.captionLinks]}>
                  Directions
                  </CaptionTitle>
                </TouchableOpacity>
              </View>
            </View>
          )
          : (
            <View style={styles.spacing} onLayout={onLayout}>
              <View style={{ marginBottom: 4 }}>
                <Headline>{`${coordinates.latitude}, ${coordinates.longitude}`}</Headline>
                <View style={styles.flexRow}>
                  <Caption>Unknown Address</Caption>
                </View>
              </View>
              <View style={styles.flexRow}>
                <TouchableOpacity
                  onPress={copyToClipboard}
                  hitSlop={hitSlopInset}
                >
                  <CaptionTitle
                    style={[{ color, marginRight: 16 }, styles.captionLinks]}
                  >
                  Copy Coordinates
                  </CaptionTitle>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openMapWithDirections}
                  hitSlop={hitSlopInset}
                >
                  <CaptionTitle style={[{ color }, styles.captionLinks]}>
                  Directions
                  </CaptionTitle>
                </TouchableOpacity>
              </View>
            </View>
          )}
      </View>
      <Divider style={[styles.divider, { width: dividerWidth + 16 }]} />
    </View>
  )
}

export default LocationSection

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row"
  },
  paddingIconSection: {
    paddingHorizontal: 16,
    alignItems: "center"
  },
  iconStyling: {
    padding: 6,
    marginRight: 16,
    borderRadius: 12,
    justifyContent: "center"
  },
  spacing: {
    flex: 1
  },
  captionLinks: {
    opacity: 1,
    fontWeight: "bold"
  },
  divider: {
    marginVertical: 16,
    height: 1,
    alignSelf: "flex-end",
    color: "#0000001A"
  }
})
