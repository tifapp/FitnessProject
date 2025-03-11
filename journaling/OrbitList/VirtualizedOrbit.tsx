import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  View
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";

export interface PositionData {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
  elevation: number;
  z: number;
}

interface Point {
  x: number;
  y: number;
}

interface OrbitItem {
  id: number;
  angle: number;
  size: number;
  virtualIndex?: number;
  swappedAt?: number;
  data?: any;
}

interface VirtualizedOrbitProps<T> {
  // Core data props
  data: T[];
  renderItem: (item: T, position: PositionData, state: { swappedAt?: number }) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;

  // Event handlers
  onEndReached?: () => void;
  onItemSwapped?: (oldItem: T, newItem: T, position: PositionData) => void;

  // Configuration
  initialIndex?: number;
  windowSize?: number;
  onEndReachedThreshold?: number;

  // Orbit visual properties
  tiltAngle?: number;
  orbitRadius?: number;
  numberOfItems?: number;
  autoRotateSpeed?: number;

  // Layout and positioning
  positionX?: number;
  positionY?: number;
  componentHeight?: number;
  componentWidth?: number;
  itemSize?: number;
  scrollSensitivity?: number;

  // Optional ring props
  showRings?: boolean;
  renderRings?: (rotation: number) => React.ReactNode;

  // Optional debug mode
  debug?: boolean;
  renderDebugOverlay?: (debugInfo: {
    startIndex: number;
    endIndex: number;
    totalItems: number;
    visibleItems: number;
    swapCount: number;
    rotation: number;
    direction: number;
  }) => React.ReactNode;
}

function VirtualizedOrbit<T>({
  // Core props with defaults
  data,
  renderItem,
  keyExtractor,

  // Event handlers
  onEndReached,
  onItemSwapped,

  // Configuration with defaults
  initialIndex = 0,
  windowSize = 50,
  onEndReachedThreshold = 0.5,

  // Orbit properties with defaults
  tiltAngle = 45,
  orbitRadius = 200,
  numberOfItems = 12,
  autoRotateSpeed = 0,

  // Layout and positioning with defaults
  positionX = Dimensions.get("window").width / 2,
  positionY = 200,
  componentHeight = 400,
  componentWidth = Dimensions.get("window").width,
  itemSize = 40,
  scrollSensitivity = 0.003,

  // Optional features
  showRings = false,
  renderRings,
  debug = false,
  renderDebugOverlay
}: VirtualizedOrbitProps<T>) {
  // Main state
  const [orbitItems, setOrbitItems] = useState<OrbitItem[]>([])
  const [swapCount, setSwapCount] = useState<number>(0)
  const [visibleItemsCount, setVisibleItemsCount] = useState<number>(0)

  // Use a single ref for virtual window tracking
  const virtualWindowRef = useRef<{
    startIndex: number,
    direction: number,
    lastSwappedId: number | null,
    lastEndReachedIndex: number,
    endReachedDirection: number | null
  }>({
    startIndex: initialIndex,
    direction: 0,
    lastSwappedId: null,
    lastEndReachedIndex: -1,
    endReachedDirection: null
  })

  // Convert tilt angle to radians
  const tiltRadian = (tiltAngle * Math.PI) / 180

  // Track rotation values
  const rotation = useSharedValue<number>(0)
  const [rotationJS, setRotationJS] = useState<number>(0)
  const prevRotationRef = useRef<number>(0)
  const lastTranslationY = useSharedValue<number>(0)

  // Apply tilt transformation to coordinates
  const applyTilt = useCallback((x: number, y: number): Point => {
    const xOrigin = x - positionX
    const yOrigin = y - positionY

    const xRotated = xOrigin * Math.cos(tiltRadian) - yOrigin * Math.sin(tiltRadian)
    const yRotated = xOrigin * Math.sin(tiltRadian) + yOrigin * Math.cos(tiltRadian)

    return {
      x: xRotated + positionX,
      y: yRotated + positionY
    }
  }, [positionX, positionY, tiltRadian])

  // Calculate position and z-index based on angle
  const calculatePosition = useCallback((item: OrbitItem): PositionData => {
    const angle = item.angle + rotationJS

    const baseX = positionX + Math.cos(angle) * orbitRadius
    const baseY = positionY + Math.sin(angle) * orbitRadius * 0.4

    const { x, y } = applyTilt(baseX, baseY)

    const z = Math.sin(angle)
    const scale = 0.6 + (z + 1) * 0.3
    const opacity = 0.6 + (z + 1) * 0.3
    const zIndex = z > 0 ? Math.round(z * 30) + 60 : Math.round(z * 30) + 10
    const elevation = z > 0 ? Math.round(z * 5) + 5 : 1

    return { x, y, scale, opacity, zIndex, elevation, z }
  }, [orbitRadius, positionX, positionY, rotationJS, applyTilt])

  // Get the end index of the virtual window
  const getEndIndex = useCallback((startIndex: number): number => {
    return (startIndex + numberOfItems - 1) % Math.max(1, data.length)
  }, [numberOfItems, data.length])

  // Initialize orbit items
  useEffect(() => {
    if (data.length === 0) return

    // To ensure we don't lose our position when data changes,
    // we need to preserve the current start index when appropriate
    const startingIndex = virtualWindowRef.current.startIndex !== initialIndex && data.length > numberOfItems
      ? virtualWindowRef.current.startIndex
      : initialIndex

    const items = Array.from({ length: numberOfItems }).map((_, index) => {
      const virtualIndex = (startingIndex + index) % data.length

      return {
        id: index,
        angle: (index * 2 * Math.PI) / numberOfItems,
        size: itemSize,
        virtualIndex,
        swappedAt: 0,
        data: data[virtualIndex]
      }
    })

    setOrbitItems(items)
    virtualWindowRef.current.startIndex = startingIndex
  }, [initialIndex, numberOfItems, data, itemSize])

  // Swap an item with new data - extracted as a pure function
  const swapItem = useCallback((
    itemId: number,
    direction: number,
    currentItems: OrbitItem[]
  ): OrbitItem[] => {
    // Find the item in our current items
    const itemToSwap = currentItems.find(item => item.id === itemId)
    if (!itemToSwap) return currentItems // No change if item not found

    // Get the virtual window start index and end index
    const { startIndex } = virtualWindowRef.current
    const endIndex = getEndIndex(startIndex)

    // Calculate new virtual index based on direction and position
    let newVirtualIndex: number
    let newStartIndex: number

    if (direction > 0) {
      // Forward: Get data that's one position after the current end
      newVirtualIndex = (endIndex + 1) % data.length
      newStartIndex = (startIndex + 1) % data.length
    } else {
      // Backward: Get data that's one position before the current start
      // We need to be careful not to reset to 0 here
      newVirtualIndex = (startIndex - 1 + data.length) % data.length
      newStartIndex = newVirtualIndex
    }

    // Get the new data
    const newData = data[newVirtualIndex]
    const oldData = itemToSwap.data

    // Notify about the swap if callback provided
    if (onItemSwapped && oldData !== newData) {
      const position = calculatePosition(itemToSwap)
      onItemSwapped(oldData, newData, position)
    }

    // Update the virtual window start index
    virtualWindowRef.current.startIndex = newStartIndex

    // Check if we need to load more data - with direction awareness
    if (onEndReached) {
      // Only consider loading more if:
      // 1. We're moving forward and near the end
      // 2. We're moving backward and near the beginning (index 0)

      let shouldFetchMore = false

      if (direction > 0) {
        // Forward direction - check if approaching the end
        const distanceToEnd = data.length - newVirtualIndex
        shouldFetchMore = distanceToEnd <= windowSize * onEndReachedThreshold
      } else if (direction < 0) {
        // Backward direction - check if near the beginning
        // Only trigger when very close to index 0 (first few items)
        shouldFetchMore = newVirtualIndex <= 5 // Just load when we get to the first few items
      }

      // Only trigger if:
      // 1. We should fetch more based on position
      // 2. We haven't already triggered for this position
      // 3. We haven't already triggered in this direction (or we're going in a new direction)
      if (shouldFetchMore &&
          virtualWindowRef.current.lastEndReachedIndex !== newVirtualIndex &&
          (virtualWindowRef.current.endReachedDirection !== direction)) {
        // Update tracking state
        virtualWindowRef.current.lastEndReachedIndex = newVirtualIndex
        virtualWindowRef.current.endReachedDirection = direction

        // Notify consumer
        setTimeout(() => onEndReached(), 0)

        // Log for debugging
        if (debug) {
          console.log(`Triggered load more at index ${newVirtualIndex}, direction ${direction > 0 ? "forward" : "backward"}`)
        }
      }
    }

    // Return the updated items array
    return currentItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          data: newData,
          virtualIndex: newVirtualIndex,
          swappedAt: Date.now()
        }
      }
      return item
    })
  }, [data, getEndIndex, calculatePosition, onItemSwapped, onEndReached, windowSize, onEndReachedThreshold])

  // Track rotation and handle item swaps
  useEffect(() => {
    if (data.length === 0 || orbitItems.length === 0) return

    // Calculate rotation delta and direction
    const rotationDelta = rotationJS - prevRotationRef.current
    const currentDirection = rotationDelta > 0 ? 1 : rotationDelta < 0 ? -1 : 0
    prevRotationRef.current = rotationJS

    // Skip tiny movements
    if (Math.abs(rotationDelta) < 0.01) return

    // Handle direction change
    const previousDirection = virtualWindowRef.current.direction
    if (currentDirection !== 0) {
      // Only update direction if it's non-zero
      if (previousDirection !== currentDirection && previousDirection !== 0) {
        // Direction changed - reset the last swapped item but keep the window position
        virtualWindowRef.current.lastSwappedId = null
        // Reset the end reached tracking when direction changes
        virtualWindowRef.current.endReachedDirection = null
      }
      virtualWindowRef.current.direction = currentDirection
    }

    // Find the backmost item (most negative z)
    let backMostItem: { id: number, z: number } | null = null
    let visibleCount = 0

    orbitItems.forEach(item => {
      const position = calculatePosition(item)

      // Count visible items
      if (position.opacity > 0.2) {
        visibleCount++
      }

      // Track backmost item
      if (backMostItem === null || position.z < backMostItem.z) {
        backMostItem = { id: item.id, z: position.z }
      }
    })

    setVisibleItemsCount(visibleCount)

      // Determine if we should swap based on the backmost item's z value
      if (backMostItem && currentDirection !== 0) {
        // Use slightly different thresholds based on direction to ensure smooth transitions
        const threshold = currentDirection > 0 ? -0.9 : -0.85
        const isHidden = backMostItem.z < threshold

        // Only swap if threshold met and this item hasn't been swapped recently
        if (isHidden && backMostItem.id !== virtualWindowRef.current.lastSwappedId) {
          // Mark this item as the last swapped
          virtualWindowRef.current.lastSwappedId = backMostItem.id

          // Perform the swap and update the items
          const updatedItems = swapItem(backMostItem.id, currentDirection, orbitItems)
          setOrbitItems(updatedItems)

          // Increment swap count for debugging
          setSwapCount(prev => prev + 1)

          // Debug logging
          if (debug) {
            console.log(`Item swap at index ${virtualWindowRef.current.startIndex}, direction: ${currentDirection > 0 ? "forward" : "backward"}`)
          }
        }
      }
  }, [rotationJS, calculatePosition, orbitItems, data.length, swapItem])

  // Auto-rotation effect
  useEffect(() => {
    if (autoRotateSpeed === 0) return

    const interval = setInterval(() => {
      const newRotation = rotation.value + (autoRotateSpeed * 0.001)
      rotation.value = newRotation
      setRotationJS(newRotation)
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [autoRotateSpeed, rotation])

  // Get the current window range for display
  const startIndex = virtualWindowRef.current.startIndex
  const endIndex = getEndIndex(startIndex)

  // Debug info object
  const debugInfo = {
    startIndex,
    endIndex,
    totalItems: data.length,
    visibleItems: visibleItemsCount,
    swapCount,
    rotation: rotationJS,
    direction: virtualWindowRef.current.direction,
    lastEndReachedIndex: virtualWindowRef.current.lastEndReachedIndex,
    endReachedDirection: virtualWindowRef.current.endReachedDirection
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={
        Gesture.Pan()
        .onBegin(() => {
          lastTranslationY.value = 0
        })
        .onUpdate((e) => {
          // Calculate delta Y since last update
          const deltaY = e.translationY - lastTranslationY.value
          lastTranslationY.value = e.translationY

          // Update rotation based on the gesture Y delta
          rotation.value -= (deltaY * scrollSensitivity)
          // Also update JS version for our calculations
          runOnJS(setRotationJS)(rotation.value)
        })
      }>
        <View
          style={[
            styles.orbitalContainer,
            {
              width: componentWidth,
              height: componentHeight
            }
          ]}
        >
          {/* Custom Rings (optional) */}
          {showRings && renderRings && renderRings(rotationJS)}

          {/* Orbit items */}
          {orbitItems.map((item) => {
            const position = calculatePosition(item)
            const { opacity } = position

            // Skip rendering completely invisible items for performance
            if (opacity < 0.1) return null

            return (
              <View
                key={item.data ? keyExtractor(item.data, item.virtualIndex || item.id) : `orbit-item-${item.id}`}
                style={[
                  styles.orbitItemContainer,
                  {
                    left: position.x,
                    top: position.y,
                    zIndex: position.zIndex
                  }
                ]}
              >
                {renderItem(
                  item.data,
                  position,
                  { swappedAt: item.swappedAt }
                )}
              </View>
            )
          })}

          {/* Debug Overlay (optional) */}
          {debug && renderDebugOverlay && renderDebugOverlay(debugInfo)}
        </View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  orbitalContainer: {
    position: "relative",
    overflow: "hidden"
  },
  orbitItemContainer: {
    position: "absolute",
    transform: [{ translateX: -50 }, { translateY: -50 }]
  }
})

export default VirtualizedOrbit
