import React from "react"
import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native"

const { width } = Dimensions.get("screen")

interface Props {
  sportVal: string,
  setSport: (s : string) => void
}

export default function SportCreation ({ setSport, sportVal } : Props) {
  return (
    <View>
      <View style={styles.nameFormat}>
        <Text>Sport: </Text>
        <TextInput
          multiline={true}
          onChangeText={setSport}
          placeholder="Enter your sport..."
          value={sportVal}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  nameFormat: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    paddingTop: 30,
    paddingBottom: 15,
    width: width / 1.3
  }
})
