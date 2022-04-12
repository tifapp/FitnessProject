// @ts-nocheck
import { listGroups } from "@graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import FeedScreen from "./FeedScreen";

export default function MyGroups({ navigation, route }) {
  //const stateRef = useRef();
  //const [query, setQuery] = useState("");
  //console.log(id);

  const showResultsAsync = async () => {
    let items = [];
    try {
      const namematchresult = await API.graphql(
        graphqlOperation(listGroups, {
          filter: {
            userID: {
              eq: route.params?.myId,
            },
          },
        })
      );
      items = [...namematchresult.data.listGroups.items];
      setUsers(items);
    } catch (err) {
      console.log("error: ", err);
    }
    setUsers(items);
  };

  useEffect(() => {
    showResultsAsync();
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenge</Text>
      </View>
      <View style={{ flex: 1 }}>
        <FeedScreen
          navigation={navigation}
          route={route}
          channel={route.params?.channel}
          challenge={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 0,
    height: 80,
    paddingTop: 25,
    backgroundColor: "#FF231F7C",
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 10,
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
  },
  buttonTextStyle: {
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
    marginHorizontal: 6,
  },
});
