import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { PositionData } from "./VirtualizedOrbit";

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

const EventItem: React.FC<EventItemProps> = ({ item, position, state }) => {
  // Generate a subtle variation in grass and rock colors based on event title
  const generateColors = (title: string) => {
    const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

    // Grass color variations (greens)
    const grassH = 100 + (hash % 40) // Green hue with some variation
    const grassS = 50 + (hash % 20)
    const grassL = 55 + (hash % 15)

    // Rock color variations (brown/gray)
    const rockH = 25 + (hash % 15) // Brown/earthy hue
    const rockS = 30 + (hash % 20)
    const rockL = 40 + (hash % 10)

    return {
      grass: `hsl(${grassH}, ${grassS}%, ${grassL}%)`,
      rock: `hsl(${rockH}, ${rockS}%, ${rockL}%)`
    }
  }

  const colors = generateColors(item.title)

  return (
    <View
      style={[
        styles.islandContainer,
        {
          transform: [{ scale: position.scale }],
          opacity: position.opacity,
          shadowOpacity: 0.3 + (position.z + 1) * 0.2,
          shadowRadius: 6 + (position.z + 1) * 3,
          elevation: 5 + (position.z + 1) * 3
        }
      ]}
    >
      {/* Simple Island Silhouette */}
      <Svg height="100%" width="100%" style={styles.islandSvg}>
        {/* Rocky bottom part */}
        <Path
          d={`
            M 10,45
            L 20,55 L 35,50 L 50,60 L 65,53 L 80,62 L 95,54
            L 110,59 L 125,52 L 140,61 L 155,55 L 170,63 L 190,56
            L 190,80 L 10,80
            Z
          `}
          fill={colors.rock}
        />

        {/* Grassy top part */}
        <Path
          d={`
            M 10,45
            C 40,35 70,30 100,30
            C 130,30 160,35 190,45
            L 190,56 L 170,63 L 155,55 L 140,61 L 125,52
            L 110,59 L 95,54 L 80,62 L 65,53 L 50,60
            L 35,50 L 20,55 L 10,45
            Z
          `}
          fill={colors.grass}
        />
      </Svg>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {item.title}
        </Text>

        <Text style={styles.dateTime}>
          {item.dateTime}
        </Text>
      </View>

      {/* Simple shadow/reflection */}
      <View style={styles.reflection} />
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
    alignItems: "center"
  },
  islandSvg: {
    position: "absolute",
    top: 0
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

export default EventItem
