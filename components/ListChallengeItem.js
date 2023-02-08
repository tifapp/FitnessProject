import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"

export default function ListChallengeItem ({ item, matchingname }) {
  const navigation = useNavigation()

  const goToGroupPosts = () => {
    console.log(item)
    navigation.navigate("Challenge", {
      channel: item.id,
      open: item.open,
      winner: item.winner
    })
  }

  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          marginHorizontal: 20,
          marginTop: 20,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1
          },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,

          elevation: 1
        }
      ]}
      onPress={goToGroupPosts}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", paddingTop: 10 }}
      >
        <MaterialCommunityIcons
          name="account-group"
          style={{ marginLeft: 20 }}
          color={item.open ? "black" : "#a9efe0"}
          size={30} // include end date in the challenge description, have an autoclose/winner function as a lambda trigger
        />
        <Text
          style={{
            marginLeft: 20,
            fontSize: 16
          }}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
