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
import { listUsers } from "./src/graphql/queries";
import Header from "./components/header";
import AddPost from "./components/AddPosts";
import UserListItem from "./components/UserListItem";
import * as subscriptions from './src/graphql/subscriptions';

Amplify.configure(awsconfig);

var styles = require('./styles/stylesheet');

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  
  const showUsersAsync = async (text) => {
    if (text !== '') {
      try {
        const namematchresult = await API.graphql(graphqlOperation(listUsers, {
          filter: {
            name: {
              contains: text
            }
          }
        }
        ));
        const biomatchresult = await API.graphql(graphqlOperation(listUsers, {
          filter: {
            bio: {
              contains: text
            }
          }
        }
        ));
        const goalsmatchresult = await API.graphql(graphqlOperation(listUsers, {
          filter: {
            goals: {
              contains: text
            }
          }
        }
        ));
        
        let items = [...new Set([...namematchresult.data.listUsers.items, ...biomatchresult.data.listUsers.items, ...goalsmatchresult.data.listUsers.items])]; //uses Set() to remove duplicates from the combined array
        
        if (text === query) {
          setUsers(items);
        }
        console.log("searching for... ", items);
      } catch (err) {
        console.log("error: ", err);
      }
    } else {
      setUsers([]);
    }
  };

  return (
    <View style={styles.containerStyle}>
      <TextInput
        style={[styles.textInputStyle, { marginTop: 40 }]}
        multiline={true}
        placeholder="Start Typing ..."
        onChangeText={(text) => {setQuery(text); showUsersAsync(text)}}
        value={query}
        clearButtonMode="always"
      />

      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserListItem
            item={item}
          />
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
};