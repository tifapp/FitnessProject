import React, { useRef, useState } from "react"
import { Alert, Button, SafeAreaView, StyleSheet, Text, View } from "react-native"
import VirtualizedOrbit from "./VirtualizedOrbit"
import { generateSequentialDataset } from "./colorUtils"

const EnhancedOrbitDemo = () => {
  // Start with items #0-199
  const [data, setData] = useState(generateSequentialDataset(200))
  const [loading, setLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(200)
  const [lastSwap, setLastSwap] = useState<{from: any, to: any} | null>(null)
  const swapHistoryRef = useRef<Array<{from: string, to: string, time: string}>>([])
  const [swapHistory, setSwapHistory] = useState<Array<{from: string, to: string, time: string}>>([])
  const [autoRotateValue, setAutoRotateValue] = useState(0)

  // Load more items when we reach the end
  const handleEndReached = () => {
    if (loading) return

    setLoading(true)

    // Simulate API fetch delay
    setTimeout(() => {
      // Generate next 50 items with sequential numbering
      const nextItems = generateSequentialDataset(50, totalItems)
      setData([...data, ...nextItems])
      setTotalItems(totalItems + 50)
      setLoading(false)

      // Show notification
      Alert.alert(
        "Items Loaded",
        `Added items #${totalItems} through #${totalItems + 49}`,
        [{ text: "OK" }]
      )
    }, 500)
  }

  // Handle item swaps (this is called by the orbit component)
  const handleItemSwapped = (oldItem: any, newItem: any, position: any) => {
    if (!oldItem || !newItem) return

    // Update swap display
    setLastSwap({
      from: oldItem,
      to: newItem
    })

    // Log swap to history
    const swapEntry = {
      from: oldItem.label || `Item ${oldItem.id}`,
      to: newItem.label || `Item ${newItem.id}`,
      time: new Date().toLocaleTimeString()
    }
    swapHistoryRef.current = [swapEntry, ...swapHistoryRef.current.slice(0, 9)]
    setSwapHistory(swapHistoryRef.current)
  }

  // Custom renderer for orbit items
  const renderOrbitItem = (item: any, position: any, orbitItemState: any) => {
    if (!item) return null

    // Get freshness indicator (items swapped in the last second)
    const isFresh = orbitItemState?.swappedAt && (Date.now() - orbitItemState.swappedAt < 1000)

    // Scale text based on item position
    const fontSize = 14 * position.scale

    return (
      <View style={styles.itemContainer}>
        <Text style={[
          styles.itemNumber,
          {
            fontSize,
            fontWeight: isFresh ? "bold" : "normal",
            color: "#FFFFFF"
          }
        ]}>
          {item.label}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enhanced Virtual Orbit</Text>
        <Text style={styles.subtitle}>
          Dataset: {totalItems} items • {loading ? "Loading..." : "Ready"}
        </Text>
      </View>

      <VirtualizedOrbit
        data={data}
        renderItem={renderOrbitItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.8}
        initialIndex={0}
        windowSize={40}
        onItemSwapped={handleItemSwapped}
        debug={true}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <Button
          title="Add 50 More Items"
          onPress={handleEndReached}
          disabled={loading}
        />
        <Button
          title="Reset Demo"
          onPress={() => {
            setData(generateSequentialDataset(200))
            setTotalItems(200)
            swapHistoryRef.current = []
            setSwapHistory([])
            setLastSwap(null)
          }}
        />
        <Button
          title={autoRotateValue > 0 ? "Stop Auto-Rotation" : "Start Auto-Rotation"}
          onPress={() => {
            // This is just used to trigger a change in the demo
            // The orbit component handles the actual auto-rotation
            setAutoRotateValue(autoRotateValue > 0 ? 0 : 5)
          }}
        />
      </View>

      {/* Swap History Panel */}
      {swapHistory.length > 0 && (
        <View style={styles.swapHistoryPanel}>
          <Text style={styles.swapHistoryTitle}>Recent Item Swaps</Text>
          {swapHistory.map((swap, index) => (
            <Text key={index} style={styles.swapHistoryItem}>
              {swap.time}: {swap.from} → {swap.to}
            </Text>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          • Drag up/down to rotate and trigger item swaps
        </Text>
        <Text style={styles.instructionText}>
          • New items flash green when first swapped in
        </Text>
        <Text style={styles.instructionText}>
          • Item numbers should change as you rotate
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5"
  },
  header: {
    padding: 16,
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333"
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  itemContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  itemNumber: {
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1
  },
  swapHistoryPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    margin: 12,
    borderRadius: 8,
    maxHeight: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  swapHistoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333"
  },
  swapHistoryItem: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4
  },
  instructions: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    margin: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  instructionText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4
  }
})

export default EnhancedOrbitDemo
