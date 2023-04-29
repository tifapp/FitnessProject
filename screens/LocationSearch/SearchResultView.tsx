import React from "react"
import {
  LocationSearchResult,
  placemarkToFormattedAddress
} from "@lib/location"
import { Caption, Headline } from "@components/Text"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { Ionicon } from "@components/common/Icons"
import { compactFormatFeet, compactFormatMiles } from "@lib/DistanceFormatting"
import { FEET_PER_MILE } from "@lib/Math"

export type LocationSearchResultProps = {
  result: LocationSearchResult
  distanceMiles?: number
  style?: StyleProp<ViewStyle>
}

/**
 * Renders a single search result for location searching.
 */
export const LocationSearchResultView = ({
  result,
  distanceMiles,
  style
}: LocationSearchResultProps) => {
  const formattedAddress = placemarkToFormattedAddress(
    result.location.placemark
  )
  return (
    <View style={[style, styles.container]}>
      <Ionicon
        name={result.isRecentLocation ? "time" : "location"}
        style={styles.iconContainer}
      />
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          {result.annotation && (
            <View style={styles.annotation}>
              <Ionicon name="people" size={12} style={styles.annotationIcon} />
              <Caption style={styles.annotationText}>
                {result.annotation === "attended-event"
                  ? "You attended an event here recently."
                  : "You hosted an event here recently."}
              </Caption>
            </View>
          )}
          <Headline style={styles.nameText}>
            {result.location.placemark.name ?? "Unknown Location"}
          </Headline>
          <Caption>{formattedAddress ?? "Unknown Address"}</Caption>
        </View>
        {distanceMiles && (
          <Headline style={styles.distanceText}>
            {compactFormatSearchResultDistance(distanceMiles)}
          </Headline>
        )}
      </View>
    </View>
  )
}

const compactFormatSearchResultDistance = (miles: number) => {
  if (miles < 0.1) return compactFormatFeet(miles * FEET_PER_MILE)
  return compactFormatMiles(miles)
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%"
  },
  iconContainer: {
    display: "flex",
    marginRight: 8
  },
  annotationText: {
    marginBottom: 4
  },
  nameText: {
    marginBottom: 4
  },
  textContainer: {
    flex: 1
  },
  rowContent: {
    width: "100%",
    flex: 1
  },
  contentContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1
  },
  distanceText: {
    marginLeft: 8
  },
  annotation: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%"
  },
  annotationIcon: {
    opacity: 0.35,
    paddingRight: 4
  }
})
