import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  Button,
  Image,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import awsconfig from "./aws-exports"; // if you are using Amplify CLI
import { Amplify, API, Auth, graphqlOperation } from "aws-amplify";
import { createUser, updateUser, deleteUser } from "./src/graphql/mutations";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listUsers } from "./src/graphql/queries";
import Header from "./components/header";
import AddPost from "./components/AddPosts";
import DeleteItem from "./components/deletePosts";

Amplify.configure(awsconfig);

const App = () => {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [userVal, setUserVal] = useState("");

  const usernameVal = async () => {
    let info = await Auth.currentUserInfo();
    setUserVal(info.attributes.email);
  };

  const pressHandler = (key) => {
    setUsers((users) => {
      return users.filter((val) => val.id != key);
    });
  };

  const addUserAsync = async () => {
    const newUser = { id: Date.now(), name: username };
    try {
      await API.graphql(graphqlOperation(createUser, { input: newUser }));
      console.log("success");
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const showUsersAsync = async () => {
    try {
      const query = await API.graphql(graphqlOperation(listUsers));
      setUsers(query.data.listUsers.items);
      console.log("success", users);
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const deleteUsersAsync = async (val) => {
    try {
      await API.graphql(graphqlOperation(deleteUser, { input: { id: val } }));
    } catch {
      console.log("error: ");
    }
  };

  return (
    <View>
      <Header />
      <TextInput
        style={styles.input}
        multiline={true}
        placeholder="New Post"
        onChangeText={setUsername}
        value={username}
      />

      <Button
        onPress={() => {
          username != ""
            ? (addUserAsync(), showUsersAsync(), usernameVal())
            : alert("No text detected in text field");
        }}
        title="Add Post"
        color="red"
      />

      <Button onPress={showUsersAsync} title="Show All Posts" color="#eeaa55" />
      <Button
        onPress={deleteUsersAsync}
        title="Delete All Posts"
        color="#eeaa55"
      />

      <FlatList
        data={users}
        renderItem={({ item }) => (
          <DeleteItem
            userVal={userVal}
            item={item}
            pressHandler={pressHandler}
            deleteUsersAsync={deleteUsersAsync}
          />
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
};

export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    fontSize: 30,
  },
  stretch: {
    flex: 1,
  },
});
