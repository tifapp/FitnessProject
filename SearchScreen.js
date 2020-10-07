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

  //we'll use a variable for debouncing in case multiple queries are sent at the same time.
  const [fetchingData, setFetchingData] = useState(false);

  const showUsersAsync = async (query) => {
    if (query !== '') {
      if (fetchingData) {
        setUsers([]);
      } else {
        setFetchingData(true);
        try {
          const namematchresult = await API.graphql(graphqlOperation(listUsers, {
            filter: {
              name: {
                contains: query
              }
            }
          }
          ));
          const biomatchresult = await API.graphql(graphqlOperation(listUsers, {
            filter: {
              bio: {
                contains: query
              }
            }
          }
          ));
          const goalsmatchresult = await API.graphql(graphqlOperation(listUsers, {
            filter: {
              goals: {
                contains: query
              }
            }
          }
          ));

          let items = [...new Set([...namematchresult.data.listUsers.items, ...biomatchresult.data.listUsers.items, ...goalsmatchresult.data.listUsers.items])]; //uses Set() to remove duplicates from the combined array

          //this is where the debounce should happen. we can discard this result if there is a newer query in line. we'll need to figure out if this query is outdated by the time it finishes. maybe compare the old query with the curreny query variable. yeah that sounds good.
          setUsers(items);
          console.log("searching for... ", items);
        } catch (err) {
          console.log("error: ", err);
        }
        setFetchingData(false);
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
        onChangeText={(text) => { setQuery(text); showUsersAsync(text) }}
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