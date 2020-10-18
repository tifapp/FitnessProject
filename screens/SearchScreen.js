import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
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
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, Auth, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "root/src/graphql/mutations";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listUsers } from "root/src/graphql/queries";
import Header from "components/header";
import AddPost from "components/AddPosts";
import UserListItem from "components/UserListItem";
import * as subscriptions from "root/src/graphql/subscriptions";
import { useNavigation } from '@react-navigation/native';

Amplify.configure(awsconfig);

var styles = require("styles/stylesheet");

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const stateRef = useRef();

  //still not 100% sure why this works, will have to come back to it. got from here: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
  stateRef.current = query;
  
  const showUsersAsync = async (text) => {
    console.log("text received: ", text);
    if (text !== '') {
      try {
        const namematchresult = await API.graphql(graphqlOperation(listUsers, {
          filter: {
            name: {
              beginsWith: text
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
        
        let items = [
          ...namematchresult.data.listUsers.items,
          ...biomatchresult.data.listUsers.items,
          ...goalsmatchresult.data.listUsers.items,
        ];
        
        items = items.filter((item, index, self) =>
          index === self.findIndex((temp) => (
            temp.id === item.id
          ))
        )

        if (text === stateRef.current) {
          setUsers(items);
          console.log("here's some users! ", text);
        } else {          
          console.log("ignoring!");
        }
      } catch (err) {
        console.log("error: ", err);
      }
    } else {
      setUsers([]);
    }
  };
  
  useEffect(() => {
    showUsersAsync(query);
  }, [query]);

  return (
    <View style={styles.containerStyle}>
      <TextInput
        style={[styles.textInputStyle, { marginTop: 40 }]}
        placeholder="Start Searching..."
        onChangeText={setQuery}
        value={query}
        clearButtonMode="always"
      />

      <FlatList
        data={users}
        renderItem={({ item }) => <UserListItem item={item} />}
      />

      <StatusBar style="auto" />
    </View>
  );
}
