import React, { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getApps, GetAppResult, showLocation } from "react-native-map-link"
import { Headline, Caption } from "@components/Text"
import {
  LocationCoordinate2D,
  Placemark,
  placemarkToAbbreviatedAddress,
  placemarkToFormattedAddress
} from "@lib/location"

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
  // const [availableApps, setAvailableApps] = useState<GetAppResult[]>([])
  /*
  const getAvailableApps = async () => {
    const result = await getApps({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    })
    console.log(result)
    setAvailableApps(result)
  } */

  const openMap = () => {
    /* const provider = availableApps.filter((app) => {
      return app.name === "Google Maps" || "Apple Maps"
    }) */
    const name =
      placemark && placemark.street
        ? placemarkToFormattedAddress(placemark)
        : ""

    showLocation({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      title: name
    })
  }
  /*
  useEffect(() => {
    getAvailableApps()
  }, []) */

  return (
    <View style={[styles.flexRow, styles.paddingIconSection]}>
      <View style={{ justifyContent: "center" }}>
        <Ionicons
          style={[styles.iconStyling, { backgroundColor: color }]}
          name="location"
          color={"white"}
          size={24}
        />
      </View>
      {placemark
        ? (
          <View style={styles.spacing}>
            <View style={{ marginBottom: 4 }}>
              <Headline>{placemark.name}</Headline>
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
              <Caption style={[{ color, marginRight: 16 }, styles.captionLinks]}>
              Copy Address
              </Caption>
              <Caption style={[{ color }, styles.captionLinks]} onPress={openMap}>
              Directions
              </Caption>
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
              <Caption style={[{ color, marginRight: 16 }, styles.captionLinks]}>
              Copy Coordinates
              </Caption>
              <Caption style={[{ color }, styles.captionLinks]} onPress={openMap}>
              Directions
              </Caption>
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
  }
})
