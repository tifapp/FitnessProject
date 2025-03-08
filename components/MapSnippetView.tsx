// Add extra inset padding to ensure map edges don't show during parallax
import { Portal } from "@gorhom/portal"
import { AppStyles } from "@lib/AppColorStyle"
import { withTiFDefaultSpring } from "@lib/Reanimated"
import React, {
  forwardRef,
  LegacyRef,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"
import {
  LayoutRectangle,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle
} from "react-native"
import MapView, { MapViewProps, Marker, Region } from "react-native-maps"
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FullWindowOverlay } from "react-native-screens"
import { TouchableIonicon } from "./common/Icons"
import { useScrollContext } from "./form-components/ScrollContext"
import { useScreenBottomPadding } from "./Padding"

// Updated inset padding function - still used but less critical with our new approach
const getInsetPadding = (parallaxFactor = 0.5) => {
  // Calculate padding based on parallax factor
  // Base padding that doesn't need to grow as much now
  const padding = Math.max(40 * parallaxFactor, 20)
  return {
    top: padding,
    bottom: padding,
    left: padding,
    right: padding
  }
}

export type ExpandableMapSnippetProps = {
isExpanded: boolean
onExpansionChanged: (isExpanded: boolean) => void
onMarkerPressed?: () => void
region: Region
overlay?: ReactNode | ((isExpanding: boolean) => ReactNode)
marker?: ReactNode
style?: StyleProp<ViewStyle>
collapsedMapProps?: MapViewProps
expandedMapProps?: MapViewProps
parallaxFactor?: number // How strong the parallax effect should be
}

/**
* A snippet of a map with an expand button that
* transitions to a full-screen map using Reanimated.
* Now with parallax scrolling effect that creates a window-like appearance.
*/
export const ExpandableMapSnippetView = forwardRef(function Snippet(
{
  isExpanded,
  onExpansionChanged,
  region,
  overlay,
  marker,
  style,
  onMarkerPressed,
  collapsedMapProps,
  expandedMapProps,
  parallaxFactor = 0.3 // Default parallax strength
}: ExpandableMapSnippetProps,
ref: LegacyRef<MapView>
) {
const snippetRef = useRef<View>(null)
const [snippetLayout, setSnippetLayout] = useState<
  LayoutRectangle | undefined
>()
const [overlayLayout, setOverlayLayout] = useState<
  LayoutRectangle | undefined
>()
const progress = useSharedValue(0)
const isExpandingShared = useSharedValue(false)
const [isExpanding, setIsExpanding] = useState(false)

// Get the scroll position from context
const { scrollY } = useScrollContext()

isExpandingShared.value = isExpanding
useEffect(() => setIsExpanding(isExpanded), [isExpanded])

// New function to calculate extended container styles based on parallax factor
const getExtendedContainerStyles = (pFactor: number) => {
  // Calculate how much the map will move during parallax (based on scrollY range)
  const maxParallaxMovement = 120 * pFactor

  // The container needs to be at least this much taller (doubled for safety)
  const extraHeight = maxParallaxMovement * 2

  // Position the map in the middle of this extended container
  const topOffset = -extraHeight / 2

  return {
    // Make the container taller than it visually appears
    height: `${100 + extraHeight}%`,
    // Position the map in the middle of this extended container
    top: topOffset
  }
}

// Updated parallax style for the extended container approach
const parallaxStyle = useAnimatedStyle(() => {
  if (!scrollY || isExpanding) return { transform: [] }

  // Calculate maximum parallax movement
  const maxMovement = 120 * parallaxFactor

  // Calculate translateY with the full range, since we now have room for it
  const translateY = interpolate(
    scrollY.value,
    [0, 300, 600],
    [0, maxMovement * 0.5, maxMovement],
    Extrapolate.CLAMP
  )

  return {
    transform: [
      { translateY: translateY - (415 * parallaxFactor) }
    ]
  }
})

const expand = useCallback(() => {
  if (!snippetRef.current) return
  snippetRef.current.measure((_, __, width, height, pageX, pageY) => {
    setSnippetLayout({ x: pageX, y: pageY, width, height })
    setIsExpanding(true)
    progress.value = 0
    onExpansionChanged(true)
    progress.value = withTiFDefaultSpring(1)
  })
}, [progress, onExpansionChanged])

const collapse = useCallback(() => {
  setIsExpanding(false)
  progress.value = withTiFDefaultSpring(0, (finished) => {
    "worklet"
    if (finished) {
      runOnJS(onExpansionChanged)(false)
    }
  })
}, [progress, onExpansionChanged])

return (
  <View style={style}>
    <View style={styles.container}>
      <TouchableIonicon
        icon={{ name: "expand" }}
        onPress={expand}
        activeOpacity={0.8}
        style={styles.expandButton}
      />
      <View ref={snippetRef} style={styles.mapContainer}>
        {overlayLayout && (
          <TouchableOpacity onPress={expand}>
            <View style={[styles.mapWrapper,
              {
                height: Math.max(overlay ? 450 : 300, 200 + overlayLayout.height)
              }]}>
              {/* Apply the extended container approach to the map view */}
              <Animated.View
                style={[
                  styles.mapAnimatedContainer,
                  // Apply the extended container styles to give room for parallax
                  getExtendedContainerStyles(parallaxFactor),
                  parallaxStyle
                ]}
              >
                <MapView
                  {...collapsedMapProps}
                  ref={ref}
                  style={[
                    {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: "100%",
                      height: "100%",
                      opacity: isExpanded ? 0 : 1
                    }
                  ]}
                  loadingEnabled
                  zoomEnabled={false}
                  scrollEnabled={false}
                  mapPadding={{
                    top: getInsetPadding(parallaxFactor).top,
                    left: getInsetPadding(parallaxFactor).left,
                    right: getInsetPadding(parallaxFactor).right,
                    bottom: overlayLayout.height + 24 + getInsetPadding(parallaxFactor).bottom
                  }}
                  // Adjust the initial region to provide more map area for parallax
                  initialRegion={{
                    ...region,
                    // Still expand the region a bit, but not as aggressively as with scaling
                    latitudeDelta: region.latitudeDelta * (1.1 + parallaxFactor * 0.2),
                    longitudeDelta: region.longitudeDelta * (1.1 + parallaxFactor * 0.2)
                  }}
                >
                  <Marker
                    coordinate={region}
                    tracksViewChanges={false}
                    onPress={onMarkerPressed}
                  >
                    {marker}
                  </Marker>
                </MapView>
              </Animated.View>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.overlayContainer}>
          <View
            style={styles.overlay}
            onLayout={(event) => setOverlayLayout(event.nativeEvent.layout)}
          >
            {overlay instanceof Function ? overlay(isExpanding) : overlay}
          </View>
        </View>
      </View>
      {snippetLayout && overlayLayout && (
        <ExpandedMapView
          isVisible={isExpanded}
          region={region}
          onCollapsed={collapse}
          isExpanding={isExpanding}
          isExpandingShared={isExpandingShared}
          progress={progress}
          overlay={overlay}
          marker={marker}
          mapLayout={snippetLayout}
          overlayLayout={overlayLayout}
          onMarkerPressed={onMarkerPressed}
          expandedMapProps={expandedMapProps}
        />
      )}
    </View>
  </View>
)
})

type ExpandedMapProps = {
region: Region
overlay?: ReactNode | ((isExpanding: boolean) => ReactNode)
marker?: ReactNode
progress: SharedValue<number>
isExpanding: boolean
isExpandingShared: SharedValue<boolean>
mapLayout: LayoutRectangle
overlayLayout: LayoutRectangle
isVisible: boolean
expandedMapProps?: MapViewProps
onMarkerPressed?: () => void
onCollapsed: () => void
}

const PortalView = Platform.OS === "ios" ? FullWindowOverlay : Portal

const ExpandedMapView = ({
mapLayout,
isVisible,
onCollapsed,
region,
overlay,
overlayLayout,
marker,
progress,
isExpanding,
isExpandingShared,
onMarkerPressed,
expandedMapProps
}: ExpandedMapProps) => {
const safeAreaInsets = useSafeAreaInsets()
const windowDimensions = useWindowDimensions()
const animatedMapStyle = useAnimatedStyle(() => {
  const { x, y, width, height } = mapLayout
  // NB: This needs to capture progress.value for the expanding animation to work.
  // eslint-disable-next-line no-unused-vars
  const _ = progress.value
  const mapHeightAdder = Platform.OS === "android" ? safeAreaInsets.top : 0
  return {
    position: "absolute" as const,
    top: withTiFDefaultSpring(isExpandingShared.value ? 0 : y),
    left: withTiFDefaultSpring(isExpandingShared.value ? 0 : x),
    width: withTiFDefaultSpring(
      isExpandingShared.value ? windowDimensions.width : width
    ),
    height: withTiFDefaultSpring(
      isExpandingShared.value
        ? windowDimensions.height + mapHeightAdder
        : height
    ),
    borderRadius: withTiFDefaultSpring(isExpandingShared.value ? 0 : 32),
    borderWidth: withTiFDefaultSpring(isExpandingShared.value ? 0 : 2)
  }
}, [mapLayout, isExpanding])
const bottomPadding = useScreenBottomPadding({
  safeAreaScreens: 8,
  nonSafeAreaScreens: 24
})
const animatedCollapseButtonStyle = useAnimatedStyle(() => ({
  position: "absolute",
  height: "100%",
  top: withTiFDefaultSpring(
    isExpandingShared.value
      ? safeAreaInsets.top + (Platform.OS === "android" ? 32 : 0)
      : 32
  ),
  right: withTiFDefaultSpring(isExpandingShared.value ? 24 : 8)
}))
const overlayStyle = useAnimatedStyle(() => ({
  paddingHorizontal: withTiFDefaultSpring(isExpandingShared.value ? 24 : 16),
  bottom: withTiFDefaultSpring(
    isExpandingShared.value ? safeAreaInsets.bottom + bottomPadding : 16
  )
}))
return (
  <PortalView>
    {isVisible && (
      <Animated.View style={[styles.mapContainer, animatedMapStyle]}>
        <MapView
          {...expandedMapProps}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          mapPadding={{
            top: 0,
            left: 0,
            right: 0,
            bottom: overlayLayout.height + 24
          }}
        >
          <Marker
            coordinate={region}
            tracksViewChanges={false}
            onPress={onMarkerPressed}
          >
            {marker}
          </Marker>
        </MapView>
        <Animated.View
          style={[styles.fullscreenOverlayContainer, overlayStyle]}
        >
          <View style={styles.fullscreenOverlay}>
            {overlay instanceof Function ? overlay(isExpanding) : overlay}
          </View>
        </Animated.View>
        <Animated.View style={animatedCollapseButtonStyle}>
          <TouchableIonicon
            icon={{ name: "contract" }}
            onPress={onCollapsed}
            activeOpacity={0.8}
            style={styles.zoomButton}
          />
        </Animated.View>
      </Animated.View>
    )}
  </PortalView>
)
}

const ZOOM_BUTTON_STYLES = {
width: 32,
minHeight: 32,
borderRadius: 1000,
backgroundColor: "white",
alignItems: "center",
justifyContent: "center"
} as const

const styles = StyleSheet.create({
container: {
  flex: 1
},
mapContainer: {
  position: "relative",
  borderRadius: 32,
  overflow: "hidden",
  borderWidth: 2,
  borderColor: AppStyles.colorOpacity35
},
mapWrapper: {
  overflow: "hidden",
  borderRadius: 32
},
mapAnimatedContainer: {
  width: "100%",
  height: "100%",
  overflow: "hidden"
},
mapView: {
  width: "100%",
  height: "100%" // Map should fill its container
},
snippetContainer: {
  height: 150,
  borderRadius: 8,
  overflow: "hidden"
},
zoomButton: ZOOM_BUTTON_STYLES,
expandButton: {
  ...ZOOM_BUTTON_STYLES,
  position: "absolute",
  right: 16,
  top: 16,
  zIndex: 50
},
overlayContainer: {
  paddingHorizontal: 16
},
overlay: {
  position: "absolute",
  bottom: 16,
  marginHorizontal: 16,
  width: "98%",
  left: "1%",
  overflow: "hidden"
},
fullscreenOverlayContainer: {
  position: "absolute",
  width: "100%",
  paddingHorizontal: 24,
  bottom: 0
},
fullscreenOverlay: {
  width: "100%",
  overflow: "hidden"
}
})
