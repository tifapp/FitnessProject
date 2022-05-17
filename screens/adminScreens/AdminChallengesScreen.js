import APIList from "@components/APIList";
import ListChallengeItem from "@components/ListChallengeItem";
import { deleteChallenge } from "@graphql/mutations";
import { listChallenges } from "@graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Challenges({ navigation, route }) {
  const listRef = useRef();
  //const [query, setQuery] = useState("");
  //console.log(id);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
      </View>
      <TouchableOpacity
        style={[styles.submitButton]}
        onPress={() => navigation.navigate("Create Challenge")} //should have a generic "create item" screen where the fields can be filled in
      >
        <Text style={styles.buttonTextStyle}>Create Challenge</Text>
      </TouchableOpacity>
      <APIList
        ref={listRef}
        style={{}}
        queryOperation={listChallenges}
        initialAmount={21}
        additionalAmount={15}
        renderItem={(
          { item, index } //need generic button component too with our custom styling
        ) => (
          <View>
            <ListChallengeItem item={item} />
            <TouchableOpacity
              onPress={() => {
                //this block of code (deleting from the database and the local list) should have a hook, maybe within apilist itself
                API.graphql(
                  graphqlOperation(deleteChallenge, { input: { id: item.id } })
                );
                listRef.current?.removeItem((i) => i.id === item.id);
              }}
            >
              <Text style={styles.textButtonStyle}>Close Challenge</Text>
            </TouchableOpacity>
          </View>
        )} //add option to close challenge
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
  textButtonStyle: {
    color: "black",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
    marginHorizontal: 6,
  },
});
