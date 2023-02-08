import React from "react"
import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native"

const { width } = Dimensions.get("screen")

interface Props {
  setDescription: (s: string) => void,
  descriptionVal: string,
  characterCount: number,
}

export default function GroupDescription ({ setDescription, descriptionVal, characterCount }: Props) {
  const totalCharsRemaining = characterCount - descriptionVal.length
  return (
    <View>
      <View style={styles.boxFormat}>
        <Text> Description: </Text>
        <Text> Characters remaining: {totalCharsRemaining}</Text>
        <TextInput
          style={styles.DescriptionBox}
          multiline={true}
          onChangeText={setDescription}
          placeholder="Enter a description for your group ...."
          value={descriptionVal}
          maxLength={1000}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  boxFormat: {
    paddingHorizontal: 8,
    paddingTop: 30,
    paddingBottom: 15
  },
  DescriptionBox: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "grey",
    borderRadius: 6,
    backgroundColor: "#d3d3d3",
    fontSize: 15,
    width: width / 1.3
  }
})
