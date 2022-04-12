// @ts-nocheck
import APIList from "@components/APIList";
import ListChallengeItem from "@components/ListChallengeItem";
import { listChallenges } from "@graphql/queries";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MyGroups({ navigation, route }) {
  //const stateRef = useRef();
  //const [query, setQuery] = useState("");
  //console.log(id);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
      </View>
      <APIList
        style={{}}
        queryOperation={listChallenges}
        //only allow admins to make challenges
        /*
        filter={{
          sortDirection: "DESC",
          filter: {
            open: {
              attributeExists: true,
            },
          },
        }}
        */
        initialAmount={21}
        additionalAmount={15}
        renderItem={({ item, index }) => <ListChallengeItem item={item} />}
        keyExtractor={(item) => item.id}
        ListEmptyMessage={"No new challenges!"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    paddingTop: 25,
    backgroundColor: "coral",
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
