import React from "react"
import { Location, placemarkToFormattedAddress } from "@lib/location"
import {
  LocationSearchAnnotation,
  LocationSearchPickerDependencyKeys,
  LocationSearchOption
} from "./DataLoading"
import { Caption, Headline } from "@components/Text"
import { useDependencyValue } from "@lib/dependencies"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { Ionicon } from "@components/common/Icons"
import { compactFormatFeet, compactFormatMiles } from "@lib/DistanceFormatting"
import { TouchableOpacity } from "react-native-gesture-handler"
import { FEET_PER_MILE } from "@lib/Math"

export type LocationSearchOptionProps = {
  option: LocationSearchOption
  distanceMiles?: number
  onSelected: (location: Location) => void
  style?: StyleProp<ViewStyle>
}

/**
 * Displays a {@link LocationSearchOption} with a specified distance.
 */
export const LocationSearchOptionView = ({
  option,
  distanceMiles,
  onSelected,
  style
}: LocationSearchOptionProps) => {
  const save = useDependencyValue(
    LocationSearchPickerDependencyKeys.saveSelection
  )
  return (
    <TouchableOpacity
      onPress={() => {
        onSelected(option.location)
        save(option.location)
      }}
    >
      <View style={[styles.container, style]}>
        <Ionicon
          name={option.isRecentLocation ? "time" : "location"}
          style={styles.iconContainer}
        />
        <OptionLabel option={option} distanceMiles={distanceMiles} />
      </View>
    </TouchableOpacity>
  )
}

type OptionLabelProps = {
  option: LocationSearchOption
  distanceMiles?: number
}

const OptionLabel = ({ option, distanceMiles }: OptionLabelProps) => {
  const formattedAddress = placemarkToFormattedAddress(
    option.location.placemark
  )
  return (
    <View style={styles.contentContainer}>
      <View style={styles.textContainer}>
        {option.annotation && <AnnotationView annotation={option.annotation} />}
        <Headline style={styles.nameText}>
          {option.location.placemark.name ?? "Unknown Location"}
        </Headline>
        <Caption>{formattedAddress ?? "Unknown Address"}</Caption>
      </View>
      {distanceMiles && (
        <Headline style={styles.distanceText}>
          {compactFormatLocationOptionDistance(distanceMiles)}
        </Headline>
      )}
    </View>
  )
}

const compactFormatLocationOptionDistance = (miles: number) => {
  if (miles < 0.1) return compactFormatFeet(miles * FEET_PER_MILE)
  return compactFormatMiles(miles)
}

type AnnotationProps = {
  annotation: LocationSearchAnnotation
}

const AnnotationView = ({ annotation }: AnnotationProps) => (
  <View style={styles.annotation}>
    <Ionicon name="people" size={12} style={styles.annotationIcon} />
    <Caption style={styles.annotationText}>
      {annotation === "attended-recently"
        ? "You attended an event here recently."
        : "You hosted an event here recently."}
    </Caption>
  </View>
)

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
