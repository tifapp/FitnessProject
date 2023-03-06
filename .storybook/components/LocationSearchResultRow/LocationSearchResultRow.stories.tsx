import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { View, StyleSheet, ScrollView } from "react-native"
import {
  LocationSearchResultRow,
  LocationSearchResultRowProps
} from "../../../components/locationSearch"

const baseSearchResult = {
  name: "Test",
  formattedAddress: "1234 Test Dr, Test City, Test State 12345",
  coordinates: { latitude: 69.6, longitude: -66.6 },
  milesAwayFromUser: 2.3,
  isInSearchHistory: false
} as const

const Rows = () => (
  <ScrollView contentContainerStyle={styles.padding}>
    <Row result={baseSearchResult} />
    <Row result={{ ...baseSearchResult, name: undefined }} />
    <Row
      result={{
        ...baseSearchResult,
        name: "Location where Address undetermined",
        formattedAddress: undefined
      }}
    />
    <Row
      result={{
        ...baseSearchResult,
        formattedAddress: undefined,
        name: undefined
      }}
    />
    <Row
      result={{
        ...baseSearchResult,
        name: "Location very close",
        milesAwayFromUser: 0.0001
      }}
    />
    <Row
      result={{
        ...baseSearchResult,
        name: "10 miles",
        milesAwayFromUser: 10
      }}
    />
    <Row
      result={{
        ...baseSearchResult,
        name: "10 Miles Decimal",
        milesAwayFromUser: 10.4
      }}
    />
    <Row
      result={{
        ...baseSearchResult,
        name: "This is a really long name that needs to wrap correctly"
      }}
    />
    <Row
      result={{
        ...baseSearchResult,
        name: "Long Address",
        formattedAddress:
          "1234 Really-Long-Street-Name St, Long City Name, Test State 12345"
      }}
    />
    <Row
      result={{
        ...baseSearchResult,
        name: "Test in Search History",
        isInSearchHistory: true
      }}
    />
  </ScrollView>
)

type RowProps = {
  result: LocationSearchResultRowProps["result"]
}

const Row = ({ result }: RowProps) => (
  <>
    <View style={styles.spacing} />
    <LocationSearchResultRow result={result} />
  </>
)

const LocationSearchResultRowMeta: ComponentMeta<typeof Rows> = {
  title: "LocationSearchResultRow",
  component: Rows
}

const styles = StyleSheet.create({
  padding: {
    paddingHorizontal: 16
  },
  spacing: {
    marginTop: 24
  }
})

export default LocationSearchResultRowMeta

type LocationSearchResultRowStory = ComponentStory<typeof Rows>

export const Listed: LocationSearchResultRowStory = () => <Rows />
