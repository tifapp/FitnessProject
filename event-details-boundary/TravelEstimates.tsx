import { AvatarMapMarkerView } from "@components/AvatarMapMarker"
import { ExpandableMapSnippetView } from "@components/MapSnippetView"
import { useCoreNavigation } from "@components/Navigation"
import {
  BodyText,
  Caption,
  CaptionTitle,
  Footnote,
  Headline
} from "@components/Text"
import { Ionicon, RoundedIonicon } from "@components/common/Icons"
import { TiFFormLabelView } from "@components/form-components/Label"
import { TiFFormNamedIconRowView } from "@components/form-components/NamedIconRow"
import { TiFFormRowItemView } from "@components/form-components/RowItem"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { openEventLocationInMaps } from "@event/LocationIdentifier"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { AppStyles } from "@lib/AppColorStyle"
import { compactFormatDistance } from "@lib/DistanceFormatting"
import { featureContext } from "@lib/FeatureContext"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { QueryHookOptions } from "@lib/ReactQuery"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { EXPO_LOCATION_ERRORS } from "@location/Expo"
import { useUserCoordinatesQuery } from "@location/UserLocation"
import {
  EventTravelEstimates,
  eventTravelEstimates
} from "@modules/tif-travel-estimates"
import { useQuery } from "@tanstack/react-query"
import { EventLocation } from "TiFShared/domain-models/Event"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { dayjs } from "TiFShared/lib/Dayjs"
import { metersToMiles } from "TiFShared/lib/MetricConversions"
import duration from "dayjs/plugin/duration"
import { openSettings } from "expo-linking"
import { LocationAccuracy } from "expo-location"
import { CodedError } from "expo-modules-core"
import { ReactNode, useState } from "react"
import {
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

export const EventTravelEstimatesFeature = featureContext({
  eventTravelEstimates
})

export type UseEventTravelEstimatesResult =
  | {
      status:
        | "pending"
        | "error"
        | "unsupported"
        | "disabled"
        | "not-permissible"
    }
  | { status: "success"; data: EventTravelEstimates }

export const formattedTravelEstimateResult = (
  result: UseEventTravelEstimatesResult,
  travelKey: keyof EventTravelEstimates
) => {
  if (result.status !== "success") return undefined
  const estimate = result.data[travelKey]
  if (!estimate) return undefined
  const travelTime = compactFormatTravelEstimateDuration(
    dayjs.duration(estimate.expectedTravelSeconds, "second")
  )
  if (!travelTime) return undefined
  return {
    travelDistance: compactFormatDistance(
      metersToMiles(estimate.travelDistanceMeters)
    ),
    travelTime
  }
}

const compactFormatTravelEstimateDuration = (duration: duration.Duration) => {
  if (duration.asMinutes() < 1) {
    return undefined
  } else if (duration.asMinutes() >= 1 && duration.asHours() < 1) {
    return `${Math.round(duration.asMinutes())} min`
  } else if (duration.asHours() >= 1 && duration.asDays() < 1) {
    const hours = Math.floor(duration.asHours())
    const minutes = duration.asMinutes() % 60
    if (minutes > 0) {
      return `${hours}h ${Math.round(minutes)}m`
    }
    return `${hours}h`
  } else {
    const days = Math.floor(duration.asDays())
    const hours = duration.asHours() % 24
    if (hours > 0) {
      return `${days}d ${Math.round(hours)}h`
    }
    return `${days}d`
  }
}

/**
 * A hook to load travel estimates for an event location from the user's
 * current location.
 *
 * **🟡 Android Note:** On android, the return value of this hook is always:
 *
 * `{ status: "unsupported" }`
 */
export const useEventTravelEstimates = (
  coordinate: LocationCoordinate2D
): UseEventTravelEstimatesResult => {
  const isSupported = Platform.OS !== "android"
  const userLocationQuery = useUserCoordinatesQuery(
    { accuracy: LocationAccuracy.BestForNavigation },
    { enabled: isSupported }
  )
  const etaResults = useEventTravelEstimatesQuery(
    userLocationQuery.data?.coords!,
    coordinate,
    { enabled: !!userLocationQuery.data && isSupported }
  )
  if (!isSupported) {
    return { status: "unsupported" }
  } else if (userLocationQuery.error instanceof CodedError) {
    return resultForCodedError(userLocationQuery.error)
  } else if (userLocationQuery.isError) {
    return { status: "error" }
  } else {
    return etaResults
  }
}

const resultForCodedError = (
  error: CodedError
): UseEventTravelEstimatesResult => {
  if (error.code === EXPO_LOCATION_ERRORS.noPermissions) {
    return { status: "not-permissible" }
  } else if (error.code === EXPO_LOCATION_ERRORS.servicesDisabled) {
    return { status: "disabled" }
  } else {
    return { status: "error" }
  }
}

const useEventTravelEstimatesQuery = (
  userCoordinate: LocationCoordinate2D,
  eventCoordinate: LocationCoordinate2D,
  options?: QueryHookOptions<EventTravelEstimates>
) => {
  const { eventTravelEstimates } = EventTravelEstimatesFeature.useContext()
  return useQuery({
    queryKey: ["event-travel-estimates", eventCoordinate, userCoordinate],
    queryFn: async ({ signal }) => {
      return await eventTravelEstimates(userCoordinate, eventCoordinate, signal)
    },
    ...options
  })
}

export type EventTravelEstimatesProps = {
  eventTitle: string
  host: ClientSideEvent["host"]
  location: EventLocation
  result: UseEventTravelEstimatesResult
  style?: StyleProp<ViewStyle>
}

/**
 * A view that displays travel estimates for an event on iOS.
 *
 * On Android, estimates are not supported, and therefore are not displayed.
 * However, the user can still get directions for a travel type by tapping on
 * the displayed icon.
 */
export const EventTravelEstimatesView = ({
  eventTitle,
  host,
  location,
  result,
  style
}: EventTravelEstimatesProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { presentProfile } = useCoreNavigation()
  const address = location.placemark
    ? placemarkToFormattedAddress(location.placemark)
    : "Unknown Address"
  return (
    <View style={[style]}>
      {result.status === "disabled" && (
        <NoticeLabel style={styles.noticeLabel}>
          Location Services is Disabled. Enable Location Services in
          <SettingsText />
          to get a precise ETA.
        </NoticeLabel>
      )}
      {result.status === "not-permissible" && (
        <NoticeLabel style={styles.noticeLabel}>
          Enable Location Permissions in
          <SettingsText />
          to get a precise ETA.
        </NoticeLabel>
      )}
      {result.status === "error" && (
        <NoticeLabel style={styles.noticeLabel}>
          An unexpected error has occurred. Please check back later to get a
          precise ETA.
        </NoticeLabel>
      )}
      <Animated.View layout={TiFDefaultLayoutTransition}>
        <ExpandableMapSnippetView
          isExpanded={isExpanded}
          onExpansionChanged={setIsExpanded}
          region={{
            ...location.coordinate,
            latitudeDelta: 0.007,
            longitudeDelta: 0.007
          }}
          overlay={(isExpanding) => (
            <View style={{ rowGap: 16 }}>
              {isExpanding && (
                <View style={styles.viewingOverlay}>
                  <TiFFormNamedIconRowView
                    iconName="location"
                    iconBackgroundColor={AppStyles.primary}
                    name={`Viewing ${eventTitle}`}
                    description={address}
                  />
                </View>
              )}
              <View style={styles.overlay}>
                <Headline
                  maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
                  style={styles.directionsText}
                >
                  Get Directions
                </Headline>
                <View style={styles.travelTypesContainer}>
                  <TravelTypeButton
                    travelKey="walking"
                    location={location}
                    result={result}
                    style={styles.travelTypeButton}
                  />
                  <TravelTypeButton
                    travelKey="automobile"
                    location={location}
                    result={result}
                    style={styles.travelTypeButton}
                  />
                  <TravelTypeButton
                    travelKey="publicTransportation"
                    location={location}
                    result={result}
                    style={styles.travelTypeButton}
                  />
                </View>
              </View>
            </View>
          )}
          collapsedMapProps={{
            customMapStyle: [
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "transit",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
          expandedMapProps={{ showsUserLocation: true }}
          marker={
            <AvatarMapMarkerView
              name={host.name}
              imageURL={host.profileImageURL ?? undefined}
            />
          }
          onMarkerPressed={() => {
            setIsExpanded(false)
            presentProfile(host.id)
          }}
        />
      </Animated.View>
    </View>
  )
}

type NoticeLabelProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

const NoticeLabel = ({ children, style }: NoticeLabelProps) => (
  <Animated.View entering={FadeIn.duration(300)}>
    <View style={style}>
      <View style={styles.noticeLabelContainer}>
        <Ionicon name="alert-circle" accessibilityLabel="Notice" />
        <BodyText style={styles.noticeLabelText}>{children}</BodyText>
      </View>
    </View>
  </Animated.View>
)

const SettingsText = () => (
  <BodyText
    onPress={openSettings}
    suppressHighlighting
    style={styles.settingsButton}
  >
    {" "}
    Settings{" "}
  </BodyText>
)

type TravelTypeButtonProps = {
  travelKey: keyof EventTravelEstimates
  location: EventLocation
  result: UseEventTravelEstimatesResult
  style?: StyleProp<ViewStyle>
}

const TravelTypeButton = ({
  travelKey,
  location,
  result,
  style
}: TravelTypeButtonProps) => {
  const formattedEstimate = formattedTravelEstimateResult(result, travelKey)
  const fontscale = useFontScale({
    maximumScaleFactor: FontScaleFactors.xxxLarge
  })
  return (
    <TouchableOpacity
      onPress={() => {
        openEventLocationInMaps(
          location,
          TRAVEL_KEYS_INFO[travelKey].directionsMode
        )
      }}
      style={style}
      activeOpacity={0.6}
    >
      <View style={styles.travelTypeButtonContentContainer}>
        <RoundedIonicon
          name={TRAVEL_KEYS_INFO[travelKey].iconName}
          color="black"
          maximumFontScaleFactor={FontScaleFactors.xxxLarge}
          borderRadius={12}
          backgroundColor={AppStyles.cardColor}
          accessibilityLabel={TRAVEL_KEYS_INFO[travelKey].accessibilityLabel}
        />
        {result.status !== "pending" ? (
          result.status !== "unsupported" && (
            <Animated.View
              style={{ height: 40 * fontscale }}
              entering={FadeIn.duration(300)}
            >
              {formattedEstimate ? (
                <View style={styles.travelTypeButtonText}>
                  <CaptionTitle
                    maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
                    style={styles.travelEstimateText}
                  >
                    {formattedEstimate.travelTime}
                  </CaptionTitle>
                  <Caption
                    maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
                    style={styles.travelEstimateText}
                  >
                    {formattedEstimate.travelDistance}
                  </Caption>
                </View>
              ) : (
                <Headline maxFontSizeMultiplier={FontScaleFactors.xxxLarge}>
                  -
                </Headline>
              )}
            </Animated.View>
          )
        ) : (
          <View style={{ height: 40 * fontscale }} />
        )}
      </View>
    </TouchableOpacity>
  )
}

const TRAVEL_KEYS_INFO = {
  automobile: {
    directionsMode: "car",
    iconName: "car",
    accessibilityLabel: "Driving Directions"
  },
  publicTransportation: {
    directionsMode: "public-transport",
    iconName: "bus",
    accessibilityLabel: "Public Transportation Directions"
  },
  walking: {
    directionsMode: "walk",
    iconName: "walk",
    accessibilityLabel: "Walking Directions"
  }
} as const

const styles = StyleSheet.create({
  mapContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden"
  },
  mapDimensions: {
    width: "100%",
    borderRadius: 12
  },
  viewingOverlay: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12
  },
  overlay: {
    width: "100%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12
  },
  directionsText: {
    textAlign: "center"
  },
  travelTypesContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16
  },
  travelTypeButton: {
    marginHorizontal: 8
  },
  travelTypeButtonContentContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 75
  },
  travelTypeButtonContent: {
    backgroundColor: AppStyles.colorOpacity15,
    padding: 8
  },
  travelTypeButtonLoadingSkeleton: {
    marginTop: 8
  },
  travelTypeButtonText: {
    marginTop: 8
  },
  travelEstimateText: {
    textAlign: "center"
  },
  noticeLabel: {
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  noticeLabelContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: AppStyles.cardColor,
    borderRadius: 12
  },
  noticeLabelText: {
    marginHorizontal: 16
  },
  settingsButton: {
    color: AppStyles.linkColor
  },
  addressText: {
    opacity: 0.5
  }
})
