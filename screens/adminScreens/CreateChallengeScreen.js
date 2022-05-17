import GroupDescription from "@components/Description";
import NameField from "@components/NameField";
import { createChallenge, updateChallenge } from "@graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//should create generic component form to update and create aws objects

export default function CreateChallenge({ navigation, route }) {
  const [nameVal, setName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [descriptionVal, setDescription] = useState("");

  const addGroup = async () => {
    Alert.alert("Creating Challenge", "", [], { cancelable: false });

    const val = {
      name: nameVal,
      open: true,
      Description: descriptionVal,
    };

    setDescription("");
    setName("");
    setDescription("");

    try {
      await API.graphql(graphqlOperation(createChallenge, { input: val }));
      console.log("success");
      alert("Group submitted successfully!");
    } catch (err) {
      console.log(err);
      alert("Group could not be submitted! " + err.errors[0].message);
    }
  };

  const updtGroup = async () => {
    Alert.alert("Updating Group...", "", [], { cancelable: false });

    setDescription("");
    setName("");

    try {
      //try catch block for api calls should be a hook
      const { group } = route.params;
      const updatedGroup = {
        id: group.id,
        name: nameVal,
        Description: descriptionVal,
      };
      await API.graphql(
        graphqlOperation(updateChallenge, { input: updatedGroup })
      );
      console.log("success");
      alert("Group submitted successfully!");
      /*
      navigation.navigate("Search", {
        updatedGroup: updatedGroup,
      });
      navigation.navigate("Group Posts Screen", {
        group: updatedGroup,
      });
      */
    } catch (err) {
      console.log(err);
      alert("Group could not be submitted! " + err.errors[0].message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <View style={styles.border}>
          <NameField setName={setName} nameVal={nameVal} />

          <GroupDescription
            setDescription={setDescription}
            descriptionVal={descriptionVal}
          />

          <View style={styles.buttonFormat}>
            <TouchableOpacity
              onPress={() => {
                nameVal != "" &&
                descriptionVal != "" &&
                route.params?.check !== undefined
                  ? updtGroup()
                  : addGroup();
              }}
              style={styles.submitButton}
            >
              {route.params?.check !== undefined ? (
                <Text style={styles.buttonTextStyle}>Save</Text>
              ) : (
                <Text style={styles.buttonTextStyle}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
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
  border: {
    alignItems: "center",
  },
  submitButton: {
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
  buttonFormat: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 30,
    paddingBottom: 15,
  },
});
