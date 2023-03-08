import React, {
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { compactFormatMiles } from "../../lib/DistanceFormatting"
import { MaterialIcon } from "@components/common/MaterialIcon"

export type LocationSearchResultRowProps = {
  result: {
    name?: string
    formattedAddress?: string
    milesAwayFromUser?: number
    isInSearchHistory: boolean
  }
  style?: StyleProp<ViewStyle>
}

/**
 * A displayed result from a location search.
 */
export const LocationSearchResultRow = ({
  result,
  style
}: LocationSearchResultRowProps) => (
  <View style={[styles.container, style]}>
    <MaterialIcon
      name={result.isInSearchHistory ? "location-history" : "location-on"}
      color="black"
      style={styles.iconContainer}
    />
    <View style={styles.contentContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{result.name ?? "Unknown Location"}</Text>
        <Text style={styles.addressText}>
          {result.formattedAddress ?? "Unknown Address"}
        </Text>
      </View>
      {result.milesAwayFromUser && result.milesAwayFromUser > 0.1 && (
        <Text style={styles.distanceText}>
          {compactFormatMiles(result.milesAwayFromUser)}
        </Text>
      )}
    </View>
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
  nameText: {
    fontSize: 16,
    marginBottom: 4
  },
  textContainer: {
    flex: 1
  },
  contentContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1
  },
  addressText: {
    fontSize: 12,
    opacity: 0.4
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8
  }
})
