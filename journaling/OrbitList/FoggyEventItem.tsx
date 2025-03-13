import React, { useMemo } from "react"
import { Image, StyleSheet, View } from "react-native"
import { PositionData } from "./VirtualizedOrbit"

// Import all floating island assets
import FloatingIsland1 from "../../assets/floating1.png"
import FloatingIsland10 from "../../assets/floating10.png"
import FloatingIsland11 from "../../assets/floating11.png"
import FloatingIsland12 from "../../assets/floating12.png"
import FloatingIsland13 from "../../assets/floating13.png"
import FloatingIsland14 from "../../assets/floating14.png"
import FloatingIsland15 from "../../assets/floating15.png"
import FloatingIsland16 from "../../assets/floating16.png"
import FloatingIsland2 from "../../assets/floating2.png"
import FloatingIsland3 from "../../assets/floating3.png"
import FloatingIsland4 from "../../assets/floating4.png"
import FloatingIsland5 from "../../assets/floating5.png"
import FloatingIsland6 from "../../assets/floating6.png"
import FloatingIsland7 from "../../assets/floating7.png"
import FloatingIsland8 from "../../assets/floating8.png"

interface SportEvent {
  id: string;
  title: string;
  dateTime: string;
  sport?: string;
  location?: string;
  duration?: string;
  spotsTotal?: number;
  spotsFilled?: number;
  skillLevel?: string;
  hostName?: string;
  hostRating?: number;
}

interface EventItemProps {
  item: SportEvent;
  position: PositionData;
  state: { swappedAt?: number };
}

// Array of all floating island images
const floatingIslands = [
  FloatingIsland1,
  FloatingIsland2,
  FloatingIsland3,
  FloatingIsland4,
  FloatingIsland5,
  FloatingIsland6,
  FloatingIsland7,
  FloatingIsland8,
  FloatingIsland10,
  FloatingIsland11,
  FloatingIsland12,
  FloatingIsland13,
  FloatingIsland14,
  FloatingIsland15,
  FloatingIsland16
]

const FoggyEventItem: React.FC<EventItemProps> = ({ item, position, state }) => {
  // Generate a consistent random island based on event ID or title
  const randomIsland = useMemo(() => {
    // Use the event title to generate a consistent index for the same event
    const hash = item.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const index = hash % floatingIslands.length
    return floatingIslands[index]
  }, [item.title])

  return (
    <View
      style={[
        styles.islandContainer,
        {
          transform: [{ scale: 2 }],
          bottom: 100,
          opacity: position.opacity,
          shadowOpacity: 0.3 + (position.z + 1) * 0.2,
          shadowRadius: 6 + (position.z + 1) * 3,
          elevation: 5 + (position.z + 1) * 3
        }
      ]}
    >
      {/* Realistic fog effect with multiple overlapping shapes */}
      <View style={styles.fogLayer1} />
      <View style={styles.fogLayer2} />
      <View style={styles.fogLayer3} />
      <View style={styles.fogLayer4} />

      {/* Black-tinted Floating Island Image */}
      <Image
        source={randomIsland}
        style={styles.islandImage}
        resizeMode="contain"
        tintColor="#000000"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  islandContainer: {
    width: 200,
    height: 100,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    alignItems: "center",
    justifyContent: "center"
  },
  fogLayer1: {
    position: "absolute",
    width: "95%",
    height: "170%",
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    opacity: 0.7,
    shadowColor: "#fff",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    left: "0%",
    top: "-20%",
    zIndex: 1
  },
  fogLayer2: {
    position: "absolute",
    width: "100%",
    height: "150%",
    borderRadius: 120,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    opacity: 0.6,
    shadowColor: "#fff",
    shadowOffset: { width: -8, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    left: "0%",
    top: "5%",
    zIndex: 1
  },
  fogLayer3: {
    position: "absolute",
    width: "80%",
    height: "160%",
    borderRadius: 140,
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    opacity: 0.75,
    shadowColor: "#fff",
    shadowOffset: { width: 3, height: -3 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    left: "10%",
    top: "-10%",
    zIndex: 1
  },
  fogLayer4: {
    position: "absolute",
    width: "90%",
    height: "140%",
    borderRadius: 130,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    opacity: 0.8,
    shadowColor: "#fff",
    shadowOffset: { width: -4, height: -2 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    left: "5%",
    top: "10%",
    zIndex: 1
  },
  islandImage: {
    position: "absolute",
    width: "150%",
    height: "150%",
    top: 0,
    zIndex: 2
  },
  contentContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 5
  },
  dateTime: {
    fontSize: 14,
    textAlign: "center",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  reflection: {
    position: "absolute",
    bottom: -15,
    width: "70%",
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 50,
    opacity: 0.5
  }
})

export default FoggyEventItem
