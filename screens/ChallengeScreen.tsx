import { ProfileImageAndName } from "@components/ProfileImageAndName"
import { useRoute } from "@react-navigation/native"
import { ChallengeFeedScreenRouteProps } from "@stacks/MainStack"
import React from "react"
import { StyleSheet, Text, View } from "react-native"
import FeedScreen from "./FeedScreen"

export default function ChallengeScreen () {
  // const stateRef = useRef();
  // const [query, setQuery] = useState("");
  // console.log(id);

  const { winner, open, channel } = useRoute<ChallengeFeedScreenRouteProps>().params

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenge</Text>
      </View>
      <View style={{ flex: 1 }}>
        <FeedScreen
          headerComponent={
            <View>
              <ProfileImageAndName userId={winner} />
            </View>
          }
          isChallenge={open}
          channel={channel}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flex: 0,
    height: 80,
    paddingTop: 25,
    backgroundColor: "#FF231F7C",
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 10
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  submitButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5
  },
  buttonTextStyle: {
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
    marginHorizontal: 6
  }
})
