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
import { listGroups } from "root/src/graphql/queries";
import Header from "components/header";
import AddPost from "components/AddPosts";
import UserListItem from "components/UserListItem";
import ListGroupItem from "components/ListGroupItem";
import * as subscriptions from "root/src/graphql/subscriptions";

Amplify.configure(awsconfig);

var styles = require("styles/stylesheet");

export default function GroupSearchScreen({ navigation, route}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const stateRef = useRef();

  const goGroupCreationScreen = () => {
    navigation.navigate('Create Group')
  }

  //still not 100% sure why this works, will have to come back to it. got from here: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
  stateRef.current = query;

  const showUsersAsync = async (text) => {
    if (text !== '') {
      try {
        const namematchresult = await API.graphql(
          graphqlOperation(listGroups, {
            filter: {
              name: {
                contains: query,
              },
            },
          })
        );

        const sportmatchresult = await API.graphql(
          graphqlOperation(listGroups, {
            filter: {
              Sport: {
                contains: query,
              },
            },
          })
        );

        let items = [...sportmatchresult.data.listGroups.items, ...namematchresult.data.listGroups.items];
        
        
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
        placeholder="Start Typing ..."
        onChangeText={setQuery}
        value={query}
        clearButtonMode="always"
      />

      <TouchableOpacity style={styles.submitButton} onPress={goGroupCreationScreen}>
        <Text style={styles.buttonTextStyle}>Create Group</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        renderItem={({ item }) => <ListGroupItem item={item} check={check}/>}
      />

      <StatusBar style="auto" />
    </View>
  );
}


