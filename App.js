import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Button,
  Image,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
} from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import awsconfig from "./aws-exports"; // if you are using Amplify CLI
import { Amplify, API, Auth, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "./src/graphql/mutations";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listPosts } from "./src/graphql/queries";
import Header from "./components/header";
import AddPost from "./components/AddPosts";
import DeleteItem from "./components/deletePosts";

Amplify.configure(awsconfig);

const App = () => {
  const [postVal, setPostVal] = useState("");
  const [posts, setPosts] = useState([]);
  const [emailVal, setEmailVal] = useState("");

  useEffect(() => {
    showPostsAsync(), addingEmail();
  }, []);

  const pressHandler = (key) => {
    setPosts((posts) => {
      return posts.filter((val) => val.id != key);
    });
  };

  const sortPosts = () => {
    posts.sort((a, b) => {
      return a.createdAt - b.created.At;
    });
  };

  const addingEmail = async () => {
    try {
      let info = await Auth.currentUserInfo();
      setEmailVal(info.attributes.email);
    } catch {
      console.log("error");
    }
  };

  const addPostAsync = async () => {
    const newUser = {
      id: Date.now(),
      name: postVal,
      email: emailVal,
      createdAt: new Date().toISOString(),
    };
    try {
      await API.graphql(graphqlOperation(createPost, { input: newUser }));
      console.log("success");
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const showPostsAsync = async () => {
    try {
      const query = await API.graphql(graphqlOperation(listPosts));
      setPosts(query.data.listPosts.items);
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const deletePostsAsync = async (val) => {
    try {
      await API.graphql(graphqlOperation(deletePost, { input: { id: val } }));
    } catch {
      console.log("error: ");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistsTaps="handled"
    >
      <View>
        <Header />
        <TextInput
          style={styles.input}
          multiline={true}
          placeholder="New Post"
          onChangeText={setPostVal}
          value={postVal}
        />

        <Button
          onPress={() => {
            postVal != ""
              ? (addingEmail(), addPostAsync(), showPostsAsync())
              : alert("No text detected in text field");
          }}
          title="Add Post"
          color="red"
        />

        <Button
          onPress={() => {
            showPostsAsync(), addingEmail();
          }}
          title="Show All Posts"
          color="#eeaa55"
        />

        <Button
          onPress={deletePostsAsync}
          title="Delete All Posts"
          color="#eeaa55"
        />

        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <DeleteItem
              item={item}
              pressHandler={pressHandler}
              deletePostsAsync={deletePostsAsync}
              emailVal={emailVal}
            />
          )}
        />

        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
};

export default withAuthenticator(App, true);

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
