import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { HSLToHex } from './colorUtils';
import OrbitRing from './OrbitRing';

interface OrbitItem {
  id: number;
  angle: number;
  color: string;
  size: number;
  label: string;
  data?: any;
  virtualIndex?: number;
  swappedAt?: number;
}

interface PositionData {
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

interface VirtualizedOrbitProps<T extends { id: string; label: string; }> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem?: (item: T, position: PositionData, itemState: OrbitItem) => React.ReactNode;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  initialIndex?: number;
  windowSize?: number;
  onItemSwapped?: (oldItem: T, newItem: T, position: PositionData) => void;
  debug?: boolean;
  
  // New configurable props (previously state variables)
  tiltAngle?: number;
  orbitRadius?: number;
  centralShapeSize?: number;
  numberOfItems?: number;
  autoRotateSpeed?: number;
  
  // Position and size props
  positionX?: number;
  positionY?: number;
  componentHeight?: number;
  componentWidth?: number;
  itemSize?: number;
  scrollSensitivity?: number;
  
  // Ring styling
  frontRingColor?: string;
  backRingColor?: string;
  ringStrokeWidth?: number;
  ringDashPattern?: string;
}

const VirtualizedOrbit = <T extends { id: string; label: string; },>({
  data,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  initialIndex = 0,
  windowSize = 50,
  onItemSwapped,
  debug = false,
  
  // Props with default values
  tiltAngle = 45,
  orbitRadius = 200,
  centralShapeSize = 180,
  numberOfItems = 12,
  autoRotateSpeed = 0,
  
  // Position and size props with defaults
  positionX = Dimensions.get('window').width / 2,
  positionY = 200,
  componentHeight = 400,
  componentWidth = Dimensions.get('window').width - 32,
  itemSize = 40,
  scrollSensitivity = 0.003,
  
  // Ring styling props
  frontRingColor = "rgba(180, 180, 220, 0.7)",
  backRingColor = "rgba(180, 180, 220, 0.3)",
  ringStrokeWidth = 2,
  ringDashPattern = "5,3"
}: VirtualizedOrbitProps<T>) => {    
  // Main state
  const [orbitItems, setOrbitItems] = useState<OrbitItem[]>([]);
  const [swapCount, setSwapCount] = useState<number>(0);
  const [visibleItemsCount, setVisibleItemsCount] = useState<number>(0);
  
  // Use a single ref for virtual window tracking
  const virtualWindowRef = useRef<{
    startIndex: number,
    direction: number,
    lastSwappedId: number | null,
    lastEndReachedIndex: number
  }>({
    startIndex: initialIndex,
    direction: 0,
    lastSwappedId: null,
    lastEndReachedIndex: -1
  });

  const tiltRadian = (tiltAngle * Math.PI) / 180;
  
  const rotation = useSharedValue<number>(0);
  const [rotationJS, setRotationJS] = useState<number>(0);
  const prevRotationRef = useRef<number>(0);
  const lastTranslationY = useSharedValue<number>(0);
  
  // Apply tilt transformation to coordinates
  const applyTilt = useCallback((x: number, y: number): Point => {
    const xOrigin = x - positionX;
    const yOrigin = y - positionY;
    
    const xRotated = xOrigin * Math.cos(tiltRadian) - yOrigin * Math.sin(tiltRadian);
    const yRotated = xOrigin * Math.sin(tiltRadian) + yOrigin * Math.cos(tiltRadian);
    
    return {
      x: xRotated + positionX,
      y: yRotated + positionY
    };
  }, [positionX, positionY, tiltRadian]);
  
  // Calculate position and z-index based on angle
  const calculatePosition = useCallback((item: OrbitItem): PositionData => {
    const angle = item.angle + rotationJS;
    
    const baseX = positionX + Math.cos(angle) * orbitRadius;
    const baseY = positionY + Math.sin(angle) * orbitRadius * 0.4;
    
    const { x, y } = applyTilt(baseX, baseY);
    
    const z = Math.sin(angle);
    const scale = 0.6 + (z + 1) * 0.3;
    const opacity = 0.6 + (z + 1) * 0.3;
    const zIndex = z > 0 ? Math.round(z * 30) + 60 : Math.round(z * 30) + 10;
    const elevation = z > 0 ? Math.round(z * 5) + 5 : 1;
    
    return { x, y, scale, opacity, zIndex, elevation, z };
  }, [orbitRadius, positionX, positionY, rotationJS, applyTilt]);
  
  // Get the end index of the virtual window
  const getEndIndex = useCallback((startIndex: number): number => {
    return (startIndex + numberOfItems - 1) % Math.max(1, data.length);
  }, [numberOfItems, data.length]);
  
  // Initialize orbit items
  useEffect(() => {
    if (data.length === 0) return;
    
    const items = Array.from({ length: numberOfItems }).map((_, index) => {
      const virtualIndex = (initialIndex + index) % data.length;
      const virtualData = data[virtualIndex];
      
      return {
        id: index,
        angle: (index * 2 * Math.PI) / numberOfItems,
        color: HSLToHex(index * (360 / numberOfItems), 70, 50),
        size: itemSize,
        label: virtualData?.label || `Item ${virtualIndex + 1}`,
        data: virtualData,
        virtualIndex: virtualIndex,
        swappedAt: 0
      };
    });
    
    setOrbitItems(items);
    virtualWindowRef.current.startIndex = initialIndex;
  }, [initialIndex, numberOfItems, data, itemSize]);

  // Swap an item with new data - extracted as a pure function
  const swapItem = useCallback((
    itemId: number, 
    direction: number, 
    currentItems: OrbitItem[]
  ): OrbitItem[] => {
    // Find the item in our current items
    const itemToSwap = currentItems.find(item => item.id === itemId);
    if (!itemToSwap) return currentItems; // No change if item not found
    
    // Get the virtual window start index
    const { startIndex } = virtualWindowRef.current;
    
    // Calculate new virtual index based on direction
    let newVirtualIndex: number;
    let newStartIndex: number;
    
    if (direction > 0) {
      // Forward: Get data that's one position after the current end
      const endIndex = getEndIndex(startIndex);
      newVirtualIndex = (endIndex + 1) % data.length;
      newStartIndex = (startIndex + 1) % data.length;
    } else {
      // Backward: Get data that's one position before the current start
      newVirtualIndex = (startIndex - 1 + data.length) % data.length;
      newStartIndex = newVirtualIndex;
    }
    
    // Get the new data
    const newData = data[newVirtualIndex];
    const oldData = itemToSwap.data;
    
    // Notify about the swap if callback provided
    if (onItemSwapped && oldData !== newData) {
      const position = calculatePosition(itemToSwap);
      onItemSwapped(oldData, newData, position);
    }
    
    // Update the virtual window start index
    virtualWindowRef.current.startIndex = newStartIndex;
    
    // Check if we need to load more data
    if (onEndReached) {
      const thresholdIndex = direction > 0 
        ? (newVirtualIndex + windowSize) % data.length
        : newVirtualIndex;
      
      const shouldFetchMore = direction > 0
        ? thresholdIndex >= data.length * onEndReachedThreshold
        : thresholdIndex <= data.length * (1 - onEndReachedThreshold);
        
      if (shouldFetchMore && virtualWindowRef.current.lastEndReachedIndex !== thresholdIndex) {
        virtualWindowRef.current.lastEndReachedIndex = thresholdIndex;
        setTimeout(() => onEndReached(), 0);
      }
    }
    
    // Return the updated items array
    return currentItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          label: newData?.label || `Item ${newVirtualIndex + 1}`,
          data: newData,
          virtualIndex: newVirtualIndex,
          swappedAt: Date.now()
        };
      }
      return item;
    });
  }, [data, getEndIndex, calculatePosition, onItemSwapped, onEndReached, windowSize, onEndReachedThreshold]);

  // Track rotation and handle item swaps
  useEffect(() => {
    if (data.length === 0 || orbitItems.length === 0) return;
    
    // Calculate rotation delta and direction
    const rotationDelta = rotationJS - prevRotationRef.current;
    const currentDirection = rotationDelta > 0 ? 1 : rotationDelta < 0 ? -1 : 0;
    prevRotationRef.current = rotationJS;
    
    // Update direction in ref
    if (currentDirection !== 0) {
      virtualWindowRef.current.direction = currentDirection;
    }
    
    // Skip tiny movements
    if (Math.abs(rotationDelta) < 0.01) return;
    
    // If the direction changed, reset the last swapped item
    if (virtualWindowRef.current.direction !== 0 && 
        currentDirection !== 0 && 
        virtualWindowRef.current.direction !== currentDirection) {
      virtualWindowRef.current.lastSwappedId = null;
    }
    
    // Find the backmost item (most negative z)
    let backMostItem: { id: number, z: number } | null = null;
    let visibleCount = 0;
    
    orbitItems.forEach(item => {
      const position = calculatePosition(item);
      
      // Count visible items
      if (position.opacity > 0.2) {
        visibleCount++;
      }
      
      // Track backmost item
      if (backMostItem === null || position.z < backMostItem.z) {
        backMostItem = { id: item.id, z: position.z };
      }
    });
    
    setVisibleItemsCount(visibleCount);
    
    // Determine if we should swap based on the backmost item's z value
    if (backMostItem) {
      const threshold = -0.9; // Consistent threshold regardless of direction
      const isHidden = backMostItem.z < threshold;
      
      // Only swap if threshold met and this item hasn't been swapped recently
      if (isHidden && backMostItem.id !== virtualWindowRef.current.lastSwappedId) {
        // Mark this item as the last swapped
        virtualWindowRef.current.lastSwappedId = backMostItem.id;
        
        // Perform the swap and update the items
        const updatedItems = swapItem(backMostItem.id, currentDirection, orbitItems);
        setOrbitItems(updatedItems);
        
        // Increment swap count for debugging
        setSwapCount(prev => prev + 1);
      }
    }
  }, [rotationJS, calculatePosition, orbitItems, data.length, swapItem]);
  
  // Auto-rotation effect
  useEffect(() => {
    if (autoRotateSpeed === 0) return;
    
    const interval = setInterval(() => {
      const newRotation = rotation.value + (autoRotateSpeed * 0.001);
      rotation.value = newRotation;
      setRotationJS(newRotation);
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [autoRotateSpeed, rotation]);
  
  // Get the current window range for display
  const startIndex = virtualWindowRef.current.startIndex;
  const endIndex = getEndIndex(startIndex);
  
  return (
    <View style={styles.container}>
      {/* Orbital Component */}
      <GestureDetector gesture={
        Gesture.Pan()
        .onBegin(() => {
          lastTranslationY.value = 0;
        })
        .onUpdate((e) => {
          // Calculate delta Y since last update
          const deltaY = e.translationY - lastTranslationY.value;
          lastTranslationY.value = e.translationY;
          
          // Update rotation based on the gesture Y delta
          rotation.value -= (deltaY * scrollSensitivity * 1.5);
          // Also update JS version for our calculations
          runOnJS(setRotationJS)(rotation.value);
        })
      }>
        <View 
          style={[
            styles.orbitalContainer,
            {
              width: componentWidth,
              height: componentHeight,
            }
          ]}
        >
          {/* Ring Component */}
          <OrbitRing
            rotation={rotationJS}
            orbitRadius={orbitRadius}
            tiltAngle={tiltAngle}
            positionX={positionX}
            positionY={positionY}
            frontStroke={frontRingColor}
            backStroke={backRingColor}
            strokeWidth={ringStrokeWidth}
            strokeDasharray={ringDashPattern}
          />
          
          {/* Central shape */}
          <View 
            style={[
              styles.centralShape,
              {
                width: centralShapeSize,
                height: centralShapeSize,
                left: positionX - centralShapeSize / 2,
                top: positionY - centralShapeSize / 2,
                borderRadius: centralShapeSize / 2,
                zIndex: 50,
                elevation: 6,
              }
            ]}
          >
            <Text style={styles.centralShapeText}>
              {data.length > 0 ? 
                `${Math.min(data.length, startIndex + 1)}-${Math.min(data.length, endIndex + 1)}` : 
                `${numberOfItems}`}
            </Text>
            {swapCount > 0 && (
              <Text style={styles.swapCountText}>
                Swaps: {swapCount}
              </Text>
            )}
          </View>
          
          {/* Orbit items - with virtualization */}
          {orbitItems.map((item) => {
            const position = calculatePosition(item)

            const { x, y, scale, opacity, zIndex, elevation } = position;
            
            // Skip rendering completely invisible items for performance
            if (opacity < 0.1) return null;
            
            // Calculate highlight status for newly swapped items
            const isNewlySwapped = item.swappedAt && Date.now() - item.swappedAt < 1000;
            
            return (
              <View
                key={data.length > 0 && item.data ? keyExtractor(item.data, item.virtualIndex || item.id) : `orbit-item-${item.id}`}
                style={[
                  styles.orbitItem,
                  {
                    backgroundColor: isNewlySwapped ? '#32CD32' : item.color, // Highlight new swaps
                    width: item.size * scale,
                    height: item.size * scale,
                    left: x - (item.size * scale) / 2,
                    top: y - (item.size * scale) / 2,
                    opacity: opacity,
                    zIndex: zIndex,
                    elevation: elevation,
                    transform: [{ scale }],
                    borderRadius: (item.size * scale) / 2,
                    borderWidth: isNewlySwapped ? 2 : 0,
                    borderColor: 'yellow',
                  }
                ]}
              >
                <Text style={styles.itemText}>{item.label}</Text>
              </View>
            );
          })}
          
          <Text style={styles.instructionText}>
            Drag up/down to rotate and navigate
          </Text>
          
          {/* Debug Overlay */}
          {debug && (
            <View style={styles.debugOverlay}>
              <Text style={styles.debugText}>
                Window: {startIndex}-{endIndex}/{data.length}
              </Text>
              <Text style={styles.debugText}>Visible: {visibleItemsCount}</Text>
              <Text style={styles.debugText}>Swaps: {swapCount}</Text>
              <Text style={styles.debugText}>Rotation: {rotationJS.toFixed(2)}</Text>
              <Text style={styles.debugText}>
                Direction: {virtualWindowRef.current.direction > 0 ? '▼ Forward' : virtualWindowRef.current.direction < 0 ? '▲ Backward' : 'None'}
              </Text>
            </View>
          )}
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  orbitalContainer: {
    position: 'relative',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  centralShape: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  centralShapeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
  },
  swapCountText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
  },
  orbitItem: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
  },
  instructionText: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  debugOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 10,
    marginBottom: 2,
  }
});

export default VirtualizedOrbit;