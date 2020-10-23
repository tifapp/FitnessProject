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
import AgePicker from "components/basicInfoComponents/AgePicker";
import * as subscriptions from "root/src/graphql/subscriptions";
import { useNavigation } from '@react-navigation/native';

Amplify.configure(awsconfig);

var styles = require("styles/stylesheet");

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [selectedAge, setSelectedAge] = useState(18);
  const [selectedMode, setSelectedMode] = useState('name');
  const [greaterThan, setGreaterThan] = useState(true);
  const [users, setUsers] = useState([]);
  const stateRef = useRef();

  //still not 100% sure why this works, will have to come back to it. got from here: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
  stateRef.current = query;
  
  const showUsersAsync = async (text) => {
    console.log("text received: ", text);
    if (text !== '') {
      try {
          //since age is being stored as a string, there may be issues doing a greater/less than comparison on it. we may have to go into profilescreen and the schema and change the age field from a string to an int.
        let matchresult;
        if (selectedMode == 'name') {
            if (greaterThan) {
                const namematchresult = await API.graphql(graphqlOperation(listUsers, {
                    filter: {
                        age: {ge: selectedAge},
                        and: {
                            name: {
                                beginsWith: text
                            }
                        }
                    }
                  }
                  ));
                matchresult = namematchresult.data.listUsers.items;
            } else {
                const namematchresult = await API.graphql(graphqlOperation(listUsers, {
                    filter: {
                        age: {le: selectedAge},
                        and: {
                            name: {
                                beginsWith: text
                            }
                        }
                    }
                  }
                  ));
                matchresult = namematchresult.data.listUsers.items;
            }
        } else {
            let biomatchresult;
            let goalsmatchresult;
            if (greaterThan) {
                
            biomatchresult = await API.graphql(graphqlOperation(listUsers, {
                filter: {
                    age: {ge: selectedAge},
                    and: {
                  bio: {
                    contains: text
                  }
                }
                }
              }
              ));
            goalsmatchresult = await API.graphql(graphqlOperation(listUsers, {
                filter: {
                    age: {ge: selectedAge},
                    and: {
                  goals: {
                    contains: text
                  }
                }
                }
              }
              ));
            } else {
                
            biomatchresult = await API.graphql(graphqlOperation(listUsers, {
                filter: {
                    age: {le: selectedAge},
                    and: {
                  bio: {
                    contains: text
                  }
                }
                }
              }
              ));
            goalsmatchresult = await API.graphql(graphqlOperation(listUsers, {
                filter: {
                    age: {le: selectedAge},
                    and: {
                  goals: {
                    contains: text
                  }
                }
                }
              }
              ));
            }
              
            matchresult = [
                ...biomatchresult.data.listUsers.items,
                ...goalsmatchresult.data.listUsers.items,
              ].filter((item, index, self) =>
              //to remove duplicates from this array
            index === self.findIndex((temp) => (
            temp.id === item.id
            ))
            )
        }

        if (text === stateRef.current) {
          setUsers(matchresult);
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
  }, [query, greaterThan, selectedAge, selectedMode]);

  return (
    <View style={styles.containerStyle}>
      <TextInput
        style={[styles.textInputStyle, { marginTop: 40 }]}
        placeholder="Start Searching..."
        onChangeText={setQuery}
        value={query}
        clearButtonMode="always"
      />
      <TouchableOpacity 
            style = { styles.outlineButtonStyle}
            onPress = {() => {
                if (selectedMode == 'name')
                    setSelectedMode('description');
                else
                    setSelectedMode('name');
            }}
        >
            <Text style = {styles.outlineButtonTextStyle}>{selectedMode}</Text>  
        </TouchableOpacity>
      
      <TouchableOpacity 
            style = { styles.outlineButtonStyle }
            onPress = {() => {
                setGreaterThan(!greaterThan);
            }}
        >
            <Text style = {styles.outlineButtonTextStyle}>{greaterThan ? '>=' : '<='}</Text>  
        </TouchableOpacity>
      <AgePicker field = {''} selectedValue = {selectedAge} setSelectedValue = {setSelectedAge} />

      <FlatList
        data={users}
        renderItem={({ item }) => <UserListItem item={item} />}
      />

      <StatusBar style="auto" />
    </View>
  );
}
