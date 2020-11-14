import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { createGroup } from "root/src/graphql/mutations";
import {
  StyleSheet,
  Text,
  Button,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Linking,
  ScrollView,
  Picker,
  Keyboard,
  Modal,
  Dimensions,
  Alert
} from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import { Amplify, API, graphqlOperation, Auth } from "aws-amplify";
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import CreatingHeader from "./GroupsHeader";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import NameField from "components/NameField";
import MaxUsers from "components/MaxUsers";
import PrivacySettings from "components/Privacy";
import SportCreation from "components/Sport";
import GroupDescription from "components/Description";

export default function CreatingGroups({route}) {

  const [nameVal, setName] = useState("");
  const [privacyVal, setPrivacy] = useState("Public");
  const [totalUsersVal, setTotalUsers] = useState("");
  const [sportVal, setSport] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [descriptionVal, setDescription] = useState("");
  const [characterCount, setCharacterCount] = useState(1000);
  
  if (route.params !== undefined) {
    useEffect(() => {
      setFields()
    }, [route.params]);
  }
  
  const setFields = () => {
    const {group} = route.params;
    setName(group.name);
    setPrivacy(group.Privacy);
    setTotalUsers(group.maxUsers)
    setSport(group.Sport);
    setDescription(group.Description);
  }

  const addGroup = async () => {
    Alert.alert('Submitting Group...', '', [], {cancelable: false})

    const val = {
      name: nameVal,
      maxUsers: totalUsersVal,
      Privacy: privacyVal,
      Sport: sportVal,
      Description: descriptionVal,
    };

    setDescription("");
    setName("");
    setPrivacy("Public");
    setTotalUsers("");
    setSport("");
    setDescription("");

    try {
      await API.graphql(graphqlOperation(createGroup, { input: val }));
      console.log("success");
      alert('Group submitted successfully!');
    } catch (err) {
      console.log(err);
      alert('Group could not be submitted! ' + err.errors[0].message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistsTaps="handled"
    >
      <View>
        <View style={styles.border}>
          <NameField setName={setName} nameVal={nameVal} />
          <MaxUsers
            setTotalUsers={setTotalUsers}
            totalUsersVal={totalUsersVal}
          />
          <PrivacySettings
            setPrivacy={setPrivacy}
            privacyVal={privacyVal}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
          />

          <SportCreation setSport={setSport} sportVal={sportVal} />

          <GroupDescription
            setDescription={setDescription}
            descriptionVal={descriptionVal}
            characterCount = {characterCount}
          />

          <View style={styles.buttonFormat}>
            <TouchableOpacity
              onPress={() => {
                nameVal != "" &&
                privacyVal != "" &&
                totalUsersVal != "" &&
                sportVal != "" &&
                descriptionVal != "" &&
                descriptionVal.length <= characterCount
                  ? addGroup()
                  : alert("Please fill out all available fields");
              }}
              style={styles.submitButton}
            >
              <Text style={styles.buttonTextStyle}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
