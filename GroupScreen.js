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
import * as subscriptions from './src/graphql/subscriptions';

Amplify.configure(awsconfig);

var styles = require('./styles/stylesheet');

export default function GroupScreen({ navigation, route }) {
  const [postVal, setPostVal] = useState("");
  const [posts, setPosts] = useState([]);
  const [emailVal, setEmailVal] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    async function showPostsFirstTime() {
      showPostsAsync();
    }

    showPostsFirstTime(); //to get rid of the "effect function must not return anything" warning
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
    const newPost = {
      timestamp: Math.floor(Date.now() / 1000),
      userId: route.params?.userId,
      description: postVal,
    };

    setPostVal("");

    try {
      await API.graphql(graphqlOperation(createPost, { input: newPost }));
      showPostsAsync();
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
      addingEmail();
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
      <View style={{}}>
        <TextInput
          style={[styles.textInputStyle, { marginTop: 40, marginBottom: 30 }]}
          multiline={true}
          placeholder="Start Typing ..."
          onChangeText={setPostVal}
          value={postVal}
          clearButtonMode="always"
        />

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 15,
        }}>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              postVal != ""
                ? (addPostAsync())
                : alert("No text detected in text field");
            }}
          >
            <Text style={styles.buttonTextStyle}>Add Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButtonStyle}
            onPress={() => {
              showPostsAsync();
            }}
          >
            <Text style={styles.outlineButtonTextStyle}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            pressHandler={pressHandler}
            deletePostsAsync={deletePostsAsync}
            writtenByYou={item.userId === route.params?.userId}
          />
        )}
      />


      <StatusBar style="auto" />
    </View>
  );
};