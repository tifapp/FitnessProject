import { BodyText, Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import React from "react"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"

export type ExploreEventsSearchBarProps = {
  text?: string
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsSearchBar = ({
  text,
  style
}: ExploreEventsSearchBarProps) => (
  <View style={[style, styles.card]}>
    <View style={styles.container}>
      <Ionicon name="search" style={styles.searchIcon} />
      {text
        ? (
          <BodyText>
          Events in <Headline>{text}</Headline>
          </BodyText>
        )
        : (
          <BodyText style={styles.placeholderText}>Search Locations...</BodyText>
        )}
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "rgba(0, 0, 0, 0.10)"
  },
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 8
  },
  leftContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  searchIcon: {
    marginRight: 8
  },
  placeholderText: {
    opacity: 0.5
  }
})
