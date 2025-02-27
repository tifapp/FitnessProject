import React, {
  useRef,
  useState,
  useCallback,
  ReactNode,
  forwardRef,
  LegacyRef,
  useEffect
} from "react"
import {
  Platform,
  View,
  useWindowDimensions,
  StyleSheet,
  StyleProp,
  ViewStyle,
  LayoutRectangle
} from "react-native"
import MapView, { MapViewProps, Marker, Region } from "react-native-maps"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  SharedValue
} from "react-native-reanimated"
import { Portal } from "@gorhom/portal"
import { withTiFDefaultSpring } from "@lib/Reanimated"
import { TouchableIonicon } from "./common/Icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useScreenBottomPadding } from "./Padding"
import { FullWindowOverlay } from "react-native-screens"

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
}

/**
 * A snippet of a map with an expand button that
 * transitions to a full-screen map using Reanimated.
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
    expandedMapProps
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
  isExpandingShared.value = isExpanding
  useEffect(() => setIsExpanding(isExpanded), [isExpanded])
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
        <View ref={snippetRef} style={styles.mapContainer}>
          {overlayLayout && (
            <MapView
              {...collapsedMapProps}
              ref={ref}
              style={[
                {
                  height: Math.max(300, 200 + overlayLayout.height),
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
                bottom: overlayLayout.height + 16
              }}
              initialRegion={region}
            >
              <Marker
                coordinate={region}
                tracksViewChanges={false}
                onPress={onMarkerPressed}
              >
                {marker}
              </Marker>
            </MapView>
          )}
          <TouchableIonicon
            icon={{ name: "contract" }}
            onPress={expand}
            activeOpacity={0.8}
            style={styles.expandButton}
          />
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
      position: "absolute",
      top: withTiFDefaultSpring(isExpandingShared.value ? 0 : y),
      left: withTiFDefaultSpring(isExpandingShared.value ? 0 : x),
      width: withTiFDefaultSpring(
        isExpandingShared.value ? windowDimensions.width : width
      ),
      height: withTiFDefaultSpring(
        isExpandingShared.value
          ? windowDimensions.height + mapHeightAdder
          : height
      )
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
        ? safeAreaInsets.top + (Platform.OS === "android" ? 8 : 0)
        : 8
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
        <Animated.View style={animatedMapStyle}>
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
  width: 40,
  minHeight: 40,
  borderRadius: 12,
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
    borderRadius: 12,
    overflow: "hidden"
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
    right: 8,
    top: 8
  },
  overlayContainer: {
    paddingHorizontal: 16
  },
  overlay: {
    position: "absolute",
    bottom: 16,
    marginHorizontal: 16,
    width: "100%",
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
