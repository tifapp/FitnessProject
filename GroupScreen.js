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
// Get the aws resources configuration parameters
import awsconfig from "./aws-exports"; // if you are using Amplify CLI
import { Amplify, API, Auth, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "./src/graphql/mutations";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listPosts } from "./src/graphql/queries";
import Header from "./components/header";
import AddPost from "./components/AddPosts";
import PostItem from "./components/PostItem";

Amplify.configure(awsconfig);

var styles = require('./styles/stylesheet');

export default function GroupScreen() {
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
      timestamp: Math.floor(Date.now()/1000),
      name: postVal,
      email: emailVal,
    };

    setPostVal("");

    try {
      await API.graphql(graphqlOperation(createPost, { input: newUser }));
      console.log("success");
    } catch (err) {
      console.log("error: ", err);
    }
    //console.log("current time..", );
  };

  const showPostsAsync = async () => {
    try {
      const query = await API.graphql(graphqlOperation(listPosts));
      let val = query.data.listPosts.items;

      val.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
      setPosts(val);
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
    <View style={styles.containerStyle}>
      <TextInput
        style={[styles.textInputStyle, {marginTop: 40}]}
        multiline={true}
        placeholder="Start Typing ..."
        onChangeText={setPostVal}
        value={postVal}
        clearButtonMode="always"
      />
      
      <View style={styles.spaceAround}>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            postVal != ""
              ? (addingEmail(), addPostAsync(), showPostsAsync())
              : alert("No text detected in text field");
          }}
        >
          <Text style={styles.buttonTextStyle}>Add Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            pressHandler={pressHandler}
            deletePostsAsync={deletePostsAsync}
            emailVal={emailVal}
          />
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
};