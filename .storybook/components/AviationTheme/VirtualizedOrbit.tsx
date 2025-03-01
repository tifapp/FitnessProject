import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { HSLToHex } from './colorUtils';
import OrbitRing from './OrbitRing';

interface OrbitItem {
  id: number;
  angle: number;
  color: string;
  size: number;
  label: string;
  data?: any; // For storing virtual data
  virtualIndex?: number; // Index in the virtual dataset
  swappedAt?: number; // Timestamp when this item was last swapped
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
  // Core state
  const [currentOrbitItems, setCurrentOrbitItems] = useState<OrbitItem[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  
  // Virtualization state
  const [virtualStartIndex, setVirtualStartIndex] = useState<number>(initialIndex);
  const lastEndReachedIndex = useRef<number>(-1);
  const visibleIndicesRef = useRef<Set<number>>(new Set());
  const lastSwapTimeRef = useRef<number>(0);
  const rotationThresholdRef = useRef<number>(0);
  const [swapCount, setSwapCount] = useState<number>(0);
  const [visibleItemsCount, setVisibleItemsCount] = useState<number>(0);

  const tiltRadian = (tiltAngle * Math.PI) / 180;
  
  // Initialize orbit items - only run this when necessary
  useEffect(() => {
    // Create base orbit items
    const items = Array.from({ length: numberOfItems }).map((_, index) => {
      const virtualIndex = (virtualStartIndex + index) % Math.max(1, data.length);
      const virtualData = data.length > 0 ? data[virtualIndex] : null;
      
      return {
        id: index,
        angle: (index * 2 * Math.PI) / numberOfItems,
        color: HSLToHex(index * (360 / numberOfItems), 70, 50),
        size: itemSize,
        label: virtualData?.label || `Item ${virtualIndex + 1}`,
        data: virtualData,
        virtualIndex: virtualIndex,
        swappedAt: Date.now() // Mark all as freshly added
      };
    });
    
    setCurrentOrbitItems(items);
    visibleIndicesRef.current = new Set(); // Reset visible indices
  }, [numberOfItems, virtualStartIndex, data.length, itemSize]); // Dependencies include the new props
  
  // Auto-rotation effect
  useEffect(() => {
    if (autoRotateSpeed === 0) return;
    
    const interval = setInterval(() => {
      setRotation(prev => prev + (autoRotateSpeed * 0.001));
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [autoRotateSpeed]);
  
  // Apply tilt transformation to coordinates
  const applyTilt = (x: number, y: number): Point => {
    const xOrigin = x - positionX;
    const yOrigin = y - positionY;
    
    const xRotated = xOrigin * Math.cos(tiltRadian) - yOrigin * Math.sin(tiltRadian);
    const yRotated = xOrigin * Math.sin(tiltRadian) + yOrigin * Math.cos(tiltRadian);
    
    return {
      x: xRotated + positionX,
      y: yRotated + positionY
    };
  };
  
  // Calculate position and z-index based on angle
  const calculatePosition = (item: OrbitItem): PositionData => {
    const angle = item.angle + rotation;
    
    const baseX = positionX + Math.cos(angle) * orbitRadius;
    const baseY = positionY + Math.sin(angle) * orbitRadius * 0.4;
    
    const { x, y } = applyTilt(baseX, baseY);
    
    const z = Math.sin(angle);
    const scale = 0.6 + (z + 1) * 0.3;
    const opacity = 0.6 + (z + 1) * 0.3;
    const zIndex = z > 0 ? Math.round(z * 30) + 60 : Math.round(z * 30) + 10;
    const elevation = z > 0 ? Math.round(z * 5) + 5 : 1;
    
    return { x, y, scale, opacity, zIndex, elevation, z };
  };
  
  // Enhanced virtualization handler - more aggressive with swapping
  useEffect(() => {
    if (data.length === 0) return;
    
    // Only check for item swapping if we've rotated enough
    const rotationDiff = Math.abs(rotation - rotationThresholdRef.current);
    if (rotationDiff < 0.05) return; // More sensitive swapping threshold
    
    // Throttle updates to prevent too many swaps
    const now = Date.now();
    if (now - lastSwapTimeRef.current < 200) return; // More frequent swaps possible
    
    // Calculate visibility for all items
    const newVisibleIndices = new Set<number>();
    let itemsToReplace: number[] = [];
    let visibleCount = 0;
    
    currentOrbitItems.forEach(item => {
      const position = calculatePosition(item);
      const { z, opacity } = position;
      
      // Check if the item is visible
      if (opacity > 0.2) {
        newVisibleIndices.add(item.id);
        visibleCount++;
      }
      
      // More aggressive with swapping - mark items as soon as they start moving back
      if (z < -0.7) {
        itemsToReplace.push(item.id);
      }
    });
    
    setVisibleItemsCount(visibleCount);
    
    // Only proceed if we have items to replace
    if (itemsToReplace.length > 0) {
      // Update our refs
      visibleIndicesRef.current = newVisibleIndices;
      lastSwapTimeRef.current = now;
      rotationThresholdRef.current = rotation;
      
      // Advance the virtual window
      const advanceBy = Math.min(itemsToReplace.length, Math.floor(numberOfItems / 4));
      const newStartIndex = (virtualStartIndex + advanceBy) % Math.max(1, data.length);
      
      setCurrentOrbitItems(prev => {
        const newItems = prev.map(item => {
          if (itemsToReplace.includes(item.id)) {
            const newVirtualIndex = (item.virtualIndex! + numberOfItems) % Math.max(1, data.length);
            const newData = data[newVirtualIndex];
            
            // Find old data for callback
            const oldData = item.data;
            const position = calculatePosition(item);
            
            // Call the swap callback
            if (onItemSwapped && oldData !== newData) {
              onItemSwapped(oldData, newData, position);
            }
            
            return {
              ...item,
              label: newData?.label || `Item ${newVirtualIndex + 1}`,
              data: newData,
              virtualIndex: newVirtualIndex,
              swappedAt: Date.now() // Track when the item was swapped
            };
          }
          return item;
        });
        
        return newItems;
      });
      
      // Increment swap count for debug display
      setSwapCount(prev => prev + itemsToReplace.length);
      
      // Update virtual start index
      setVirtualStartIndex(newStartIndex);
      
      // Check if we need to fetch more data
      if (onEndReached && 
          newStartIndex + windowSize >= data.length * onEndReachedThreshold && 
          lastEndReachedIndex.current !== newStartIndex) {
        lastEndReachedIndex.current = newStartIndex;
        onEndReached();
      }
    }
  }, [rotation, data, numberOfItems, virtualStartIndex, windowSize, onEndReached, onEndReachedThreshold, debug]);
  
  // PanResponder for handling drag gestures
  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: (): boolean => true,
      onMoveShouldSetPanResponder: (): boolean => true,
      onPanResponderMove: (
        _: GestureResponderEvent, 
        gestureState: PanResponderGestureState
      ): void => {
        const { dy } = gestureState;
        setRotation(prevRotation => prevRotation - (dy * scrollSensitivity * 1.5));
      },
    })
  ).current;
  
  return (
    <View style={styles.container}>
      {/* Orbital Component */}
      <View 
        style={[
          styles.orbitalContainer,
          {
            width: componentWidth,
            height: componentHeight,
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Ring Component */}
        <OrbitRing
          rotation={rotation}
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
              `${Math.min(data.length, virtualStartIndex + 1)}-${Math.min(data.length, virtualStartIndex + numberOfItems)}` : 
              `${numberOfItems}`}
          </Text>
          {swapCount > 0 && (
            <Text style={styles.swapCountText}>
              Swaps: {swapCount}
            </Text>
          )}
        </View>
        
        {/* Orbit items - with virtualization */}
        {currentOrbitItems.map((item) => {
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
            <Text style={styles.debugText}>Virtual: {virtualStartIndex}/{data.length}</Text>
            <Text style={styles.debugText}>Visible: {visibleItemsCount}</Text>
            <Text style={styles.debugText}>Swaps: {swapCount}</Text>
            <Text style={styles.debugText}>Rotation: {rotation.toFixed(2)}</Text>
          </View>
        )}
      </View>
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