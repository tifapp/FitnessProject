import Slider from '@react-native-community/slider';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HSLToHex } from './colorUtils';

// Type definitions
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

interface RingPaths {
  frontPathD: string;
  backPathD: string;
}

// New props for virtualization
interface VirtualizedOrbitProps {
  data?: any[]; // Virtual dataset
  renderItem?: (item: any, position: PositionData, itemState: OrbitItem) => React.ReactNode;
  keyExtractor?: (item: any, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  initialIndex?: number;
  windowSize?: number;
  onItemSwapped?: (oldItem: any, newItem: any, position: PositionData) => void;
  debug?: boolean;
}

const VirtualizedOrbit: React.FC<VirtualizedOrbitProps> = ({
  data = [],
  renderItem,
  keyExtractor = (_, index) => `item-${index}`,
  onEndReached,
  onEndReachedThreshold = 0.5,
  initialIndex = 0,
  windowSize = 50,
  onItemSwapped,
  debug = false
}) => {
  // Original configuration parameters
  const [tiltAngle, setTiltAngle] = useState<number>(45);
  const [orbitRadius, setOrbitRadius] = useState<number>(200);
  const [centralShapeSize, setCentralShapeSize] = useState<number>(180);
  const [numberOfItems, setNumberOfItems] = useState<number>(12);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(true);
  
  // Position and size controls
  const [positionX, setPositionX] = useState<number>(Dimensions.get('window').width / 2);
  const [positionY, setPositionY] = useState<number>(200);
  const [componentHeight, setComponentHeight] = useState<number>(400);
  const [componentWidth, setComponentWidth] = useState<number>(Dimensions.get('window').width - 32);
  
  // Core state
  const [orbitItems, setOrbitItems] = useState<OrbitItem[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  
  // Virtualization state
  const [virtualStartIndex, setVirtualStartIndex] = useState<number>(initialIndex);
  const lastEndReachedIndex = useRef<number>(-1);
  const visibleIndicesRef = useRef<Set<number>>(new Set());
  const lastSwapTimeRef = useRef<number>(0);
  const rotationThresholdRef = useRef<number>(0);
  const [swapCount, setSwapCount] = useState<number>(0);
  const [visibleItemsCount, setVisibleItemsCount] = useState<number>(0);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState<{[key: string]: any}>({});
  
  // Fixed configuration
  const screenWidth = Dimensions.get('window').width;
  const centerX = positionX;
  const centerY = positionY;
  const itemSize = 40;
  const scrollSensitivity = 0.003;
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
    
    setOrbitItems(items);
    visibleIndicesRef.current = new Set(); // Reset visible indices
    
    // Update debug info
    if (debug) {
      setDebugInfo(prev => ({
        ...prev,
        itemsInitialized: true,
        initTime: new Date().toLocaleTimeString(),
        numberOfItems,
        virtualStartIndex
      }));
    }
  }, [numberOfItems, virtualStartIndex, data.length]); // Reduced dependencies
  
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
    const xOrigin = x - centerX;
    const yOrigin = y - centerY;
    
    const xRotated = xOrigin * Math.cos(tiltRadian) - yOrigin * Math.sin(tiltRadian);
    const yRotated = xOrigin * Math.sin(tiltRadian) + yOrigin * Math.cos(tiltRadian);
    
    return {
      x: xRotated + centerX,
      y: yRotated + centerY
    };
  };
  
  // Calculate position and z-index based on angle
  const calculatePosition = (item: OrbitItem): PositionData => {
    const angle = item.angle + rotation;
    
    const baseX = centerX + Math.cos(angle) * orbitRadius;
    const baseY = centerY + Math.sin(angle) * orbitRadius * 0.4;
    
    const { x, y } = applyTilt(baseX, baseY);
    
    const z = Math.sin(angle);
    const scale = 0.6 + (z + 1) * 0.3;
    const opacity = 0.6 + (z + 1) * 0.3;
    const zIndex = z > 0 ? Math.round(z * 30) + 60 : Math.round(z * 30) + 10;
    const elevation = z > 0 ? Math.round(z * 5) + 5 : 1;
    
    return { x, y, scale, opacity, zIndex, elevation, z };
  };
  
  // Generate the path for the connecting ring
  const generateRingPath = useMemo(() => {
    const frontPoints: Point[] = [];
    const backPoints: Point[] = [];
    
    const numPoints = 100;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI + rotation;
      
      const baseX = centerX + Math.cos(angle) * orbitRadius;
      const baseY = centerY + Math.sin(angle) * orbitRadius * 0.4;
      
      const { x, y } = applyTilt(baseX, baseY);
      
      const z = Math.sin(angle);
      
      if (z >= 0) {
        frontPoints.push({ x, y });
      } else {
        backPoints.push({ x, y });
      }
    }
    
    let frontPathD = '';
    let backPathD = '';
    
    if (frontPoints.length > 0) {
      frontPathD = `M ${frontPoints[0].x} ${frontPoints[0].y} `;
      frontPoints.forEach((point, i) => {
        if (i > 0) frontPathD += `L ${point.x} ${point.y} `;
      });
    }
    
    if (backPoints.length > 0) {
      backPathD = `M ${backPoints[0].x} ${backPoints[0].y} `;
      backPoints.forEach((point, i) => {
        if (i > 0) backPathD += `L ${point.x} ${point.y} `;
      });
    }
    
    return { frontPathD, backPathD };
  }, [rotation, orbitRadius, tiltRadian, centerX, centerY]);
  
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
    
    orbitItems.forEach(item => {
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
      
      // Update orbit items with new virtual data
      const itemsBeforeSwap = [...orbitItems];
      
      setOrbitItems(prev => {
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
      
      // Debug info
      if (debug) {
        setDebugInfo(prev => ({
          ...prev,
          lastSwap: new Date().toLocaleTimeString(),
          swapCount: swapCount + itemsToReplace.length,
          itemsReplaced: itemsToReplace.length,
          virtualWindow: `${newStartIndex}-${newStartIndex + numberOfItems}`,
          rotationValue: rotation.toFixed(2)
        }));
      }
      
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
  
  // Reset to default values
  const handleReset = () => {
    setTiltAngle(45);
    setOrbitRadius(200);
    setCentralShapeSize(180);
    setNumberOfItems(12);
    setAutoRotateSpeed(0);
    setRotation(0);
    setPositionX(Dimensions.get('window').width / 2);
    setPositionY(200);
    setComponentHeight(400);
    setComponentWidth(Dimensions.get('window').width - 32);
    setVirtualStartIndex(initialIndex);
    setSwapCount(0);
    visibleIndicesRef.current = new Set();
    lastSwapTimeRef.current = 0;
    rotationThresholdRef.current = 0;
    
    if (debug) {
      setDebugInfo(prev => ({
        ...prev,
        reset: new Date().toLocaleTimeString()
      }));
    }
  };
  
  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };
  
  // Memoize position calculations to reduce render work
  const positionCalculations = useMemo(() => {
    return orbitItems.map(item => ({
      item,
      position: calculatePosition(item)
    }));
  }, [orbitItems, rotation, tiltAngle, orbitRadius, centerX, centerY]);
  
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
        {/* SVG for rings */}
        <Svg style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
          {/* Back half of ring (behind center) */}
          <Path
            d={generateRingPath.backPathD}
            fill="none"
            stroke="rgba(180, 180, 220, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
        </Svg>
        
        <Svg style={[StyleSheet.absoluteFill, { zIndex: 55 }]}>
          {/* Front half of ring (in front of center) */}
          <Path
            d={generateRingPath.frontPathD}
            fill="none"
            stroke="rgba(180, 180, 220, 0.7)"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
        </Svg>
        
        {/* Central shape */}
        <View 
          style={[
            styles.centralShape,
            {
              width: centralShapeSize,
              height: centralShapeSize,
              left: centerX - centralShapeSize / 2,
              top: centerY - centralShapeSize / 2,
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
        {positionCalculations.map(({ item, position }) => {
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
              {renderItem ? (
                renderItem(item.data, position, item)
              ) : (
                <Text style={styles.itemText}>{item.label}</Text>
              )}
            </View>
          );
        })}
        
        <Text style={styles.instructionText}>
          Drag up/down to rotate and navigate
        </Text>
        
        {/* Toggle Controls Button */}
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={toggleControls}
        >
          <Text style={styles.toggleButtonText}>
            {showControls ? 'Hide Controls' : 'Show Controls'}
          </Text>
        </TouchableOpacity>
        
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
      
      {/* Controls Panel */}
      {showControls && (
        <View style={styles.controlsPanel}>
          <View style={styles.controlsHeader}>
            <Text style={styles.controlsTitle}>Orbital Controls</Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.controlsScroll}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.controlsGrid}>
              {/* Auto-rotation Speed Control - Featured at top for easier testing */}
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>
                  Auto-rotation Speed: {autoRotateSpeed === 0 ? 'Off' : autoRotateSpeed}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10}
                  value={autoRotateSpeed}
                  onValueChange={value => setAutoRotateSpeed(Math.round(value))}
                  minimumTrackTintColor="#1FB2F5"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1FB2F5"
                />
              </View>
              
              {/* Virtualization controls */}
              {data.length > 0 && (
                <View style={styles.controlItem}>
                  <Text style={styles.controlLabel}>
                    Virtual Window: {virtualStartIndex}/{data.length}
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={Math.max(0, data.length - numberOfItems)}
                    value={virtualStartIndex}
                    onValueChange={value => setVirtualStartIndex(Math.round(value))}
                    minimumTrackTintColor="#1FB2F5"
                    maximumTrackTintColor="#d3d3d3"
                    thumbTintColor="#1FB2F5"
                  />
                </View>
              )}
              
              {/* Number of Items Control */}
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>
                  Visible Items: {numberOfItems}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={3}
                  maximumValue={24}
                  value={numberOfItems}
                  onValueChange={value => setNumberOfItems(Math.round(value))}
                  minimumTrackTintColor="#1FB2F5"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1FB2F5"
                />
              </View>
              
              {/* Tilt Angle Control */}
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>
                  Tilt Angle: {tiltAngle}°
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={360}
                  value={tiltAngle}
                  onValueChange={value => setTiltAngle(Math.round(value))}
                  minimumTrackTintColor="#1FB2F5"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1FB2F5"
                />
              </View>
              
              {/* Orbit Radius Control */}
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>
                  Orbit Size: {orbitRadius}px
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={100}
                  maximumValue={300}
                  value={orbitRadius}
                  onValueChange={value => setOrbitRadius(Math.round(value))}
                  minimumTrackTintColor="#1FB2F5"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1FB2F5"
                />
              </View>
              
              {/* Central Shape Size Control */}
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>
                  Center Size: {centralShapeSize}px
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={60}
                  maximumValue={240}
                  value={centralShapeSize}
                  onValueChange={value => setCentralShapeSize(Math.round(value))}
                  minimumTrackTintColor="#1FB2F5"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1FB2F5"
                />
              </View>
              
              {/* Position X Control */}
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>
                  Center X: {Math.round(positionX)}px
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={screenWidth}
                  value={positionX}
                  onValueChange={value => setPositionX(value)}
                  minimumTrackTintColor="#1FB2F5"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1FB2F5"
                />
              </View>
              
              {/* Position Y Control */}
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>
                  Center Y: {Math.round(positionY)}px
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={50}
                  maximumValue={600}
                  value={positionY}
                  onValueChange={value => setPositionY(value)}
                  minimumTrackTintColor="#1FB2F5"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1FB2F5"
                />
              </View>
              
              {/* Component Height Control */}
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>
                  Height: {componentHeight}px
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={200}
                  maximumValue={800}
                  value={componentHeight}
                  onValueChange={value => setComponentHeight(Math.round(value))}
                  minimumTrackTintColor="#1FB2F5"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1FB2F5"
                />
              </View>
              
              {/* Component Width Control */}
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>
                  Width: {componentWidth}px
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={100}
                  maximumValue={screenWidth}
                  value={componentWidth}
                  onValueChange={value => setComponentWidth(Math.round(value))}
                  minimumTrackTintColor="#1FB2F5"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1FB2F5"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      )}
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
  controlsPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 16,
    maxHeight: '60%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
  },
  controlsScroll: {
    maxHeight: '100%',
    width: '100%',
  },
  controlsGrid: {
    width: '100%',
    paddingBottom: 20,
  },
  controlItem: {
    marginBottom: 16,
  },
  controlLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
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
  toggleButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(27, 127, 204, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
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