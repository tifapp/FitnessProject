import { useSharedState } from ".storybook/components/HoverContext/useSharedState"
import { Portal } from "@gorhom/portal"
import { AppStyles } from "@lib/AppColorStyle"
import { useAnimatedParallaxStyle } from "@lib/Parallax"
import { withTiFDefaultSpring } from "@lib/Reanimated"
import React, {
  ReactNode,
  useCallback,
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
import MapView, {
  LongPressEvent,
  MapViewProps,
  Marker,
  Region
} from "react-native-maps"
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FullWindowOverlay } from "react-native-screens"
import { TouchableIonicon } from "./common/Icons"
import { useScreenBottomPadding } from "./Padding"

const PARALLAX_FACTOR = 3

export type ExpandableMapPreviewProps = {
isExpanded: boolean
onExpansionChanged: (isExpanded: boolean) => void
onMarkerPressed?: () => void
region: Region
overlay?: ReactNode | ((isExpanding: boolean) => ReactNode)
marker?: ReactNode
style?: StyleProp<ViewStyle>
collapsedMapProps?: MapViewProps
expandedMapProps?: MapViewProps
onMapLongPress?: (event: LongPressEvent) => void
}

const getExtendedContainerStyles = (pFactor: number) => {
  return {
    height: `${100 * pFactor}%`,
    top: "50%"
  } as StyleProp<ViewStyle>
}

/**
* A snippet of a map with an expand button that transitions to a full-screen map using Reanimated with parallax scrolling effect that creates a window-like appearance.
*/
export const MapPreview = ({
  isExpanded,
  onExpansionChanged,
  region,
  overlay,
  marker,
  style,
  onMarkerPressed,
  collapsedMapProps,
  expandedMapProps
}: ExpandableMapPreviewProps) => {
  const snippetRef = useRef<View>(null)
  const [snippetLayout, setSnippetLayout] = useState<
    LayoutRectangle | undefined
  >()
  const [overlayLayout, setOverlayLayout] = useState<
    LayoutRectangle | undefined
  >()
  const progress = useSharedValue(0)

  const [isExpanding, setIsExpanding, isExpandingShared] = useSharedState(false)

  const parallaxStyle = useAnimatedParallaxStyle((scrollProgress) => {
    "worklet"

    if (isExpandingShared.value) return { transform: [] }

    const maxMovement = 120 * PARALLAX_FACTOR

    const translateY = interpolate(
      scrollProgress.value,
      [0, 0.3, 0.7],
      [0, maxMovement * 0.4, maxMovement]
    )

    return {
      transform: [
        { translateY: translateY - (350 * PARALLAX_FACTOR) }
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
                <Animated.View
                  style={[
                    styles.mapAnimatedContainer,
                    getExtendedContainerStyles(PARALLAX_FACTOR),
                    parallaxStyle
                  ]}
                >
                  <MapView
                    {...collapsedMapProps}
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
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: overlayLayout.height + 24 * PARALLAX_FACTOR
                    }}
                    initialRegion={{
                      ...region,
                      latitudeDelta: region.latitudeDelta,
                      longitudeDelta: region.longitudeDelta
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
}

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
    borderColor: AppStyles.colorOpacity15
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
    height: "100%"
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
