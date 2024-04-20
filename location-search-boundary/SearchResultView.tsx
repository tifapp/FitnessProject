import { Caption, Headline } from "@components/Text"
import { CircularIonicon, Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { compactFormatDistance } from "@lib/DistanceFormatting"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { LocationSearchResult } from "./SearchClient"
import { RecentLocationAnnotation } from "@location/Recents"

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
      <CircularIonicon
        backgroundColor={
          result.isRecentLocation
            ? AppStyles.colorOpacity35
            : AppStyles.darkColor
        }
        accessibilityLabel={
          result.isRecentLocation ? "Recent Search" : "Search Result"
        }
        name={result.isRecentLocation ? "time" : "location"}
        style={styles.iconContainer}
      />
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          {result.annotation && (
            <View style={styles.annotation}>
              <Ionicon name="people" size={12} style={styles.annotationIcon} />
              <Caption style={styles.annotationText}>
                {ANNOTATION_MESSAGES[result.annotation]}
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
            {compactFormatDistance(distanceMiles)}
          </Headline>
        )}
      </View>
    </View>
  )
}

const ANNOTATION_MESSAGES = {
  "attended-event": "You attended an event here recently.",
  "hosted-event": "You hosted an event here recently.",
  "joined-event": "You joined an event here recently."
} satisfies Record<RecentLocationAnnotation, string>

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%"
  },
  iconContainer: {
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
