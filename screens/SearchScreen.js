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
    ActivityIndicator,
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, } from "aws-amplify";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listGroups } from "root/src/graphql/queries";
import { listUsers } from "root/src/graphql/queries";
import Header from "components/header";
import UserListItem from "components/UserListItem";
import ListGroupItem from "components/ListGroupItem";
import * as subscriptions from "root/src/graphql/subscriptions";
import AgePicker from "components/basicInfoComponents/AgePicker";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import APIList from 'components/APIList';

Amplify.configure(awsconfig);

var styles = require("styles/stylesheet");

export default function GroupSearchScreen({ navigation, route }) {
    const [query, setQuery] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [groupResults, setGroupResults] = useState([]);
    const [type, setType] = useState("user"); //refreshing tho
    const searchBarRef = useRef();
    const ListRef = useRef();
    const currentQuery = useRef();

    currentQuery.current = query;

    useEffect(() => {
        if (query !== "") {
            if (type !== "all") (type === "group") ? setUserResults([]) : setGroupResults([]); //clears results for the tab you arent looking at 
            console.log("START-----------------------");
            console.log("the query being checked is ", query);
            ListRef.current.fetchDataAsync(true, ()=>{
                return (currentQuery.current !== query)
            })
        } else {
            setUserResults([]);
            setGroupResults([]);
        }
    }, [query]);
    
    useEffect(() => {
        if (query !== "") {
            if (((type === "group" || type === "all") && groupResults.length === 0) || ((type === "user" || type === "all") && userResults.length === 0))
            ListRef.current.fetchDataAsync(true, ()=>{
                return (currentQuery.current !== query)
            })
        }
    }, [type]);

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.containerStyle}>
                <TouchableOpacity style={[{
                    flexDirection: 'row',
                    marginTop: 10,
                    marginBottom: 10,
                }]}
                    onPress={() => {
                        searchBarRef.current.focus();
                    }}
                >
                    <TextInput
                        ref={searchBarRef}
                        style={[styles.textInputStyle, { flexGrow: 1 }]}
                        placeholder="Search for names or keywords!"
                        onChangeText={(text) => {
                            setQuery(text.trim());
                        }}
                        value={query}
                        clearButtonMode="always"
                    />
                    <MaterialCommunityIcons name="magnify" size={28} color="gray"
                        style={[{ marginRight: 10 }]} />
                </TouchableOpacity>

                {
                    query !== ""
                        ? <View>
                            <View style={[styles.spacingTop, {
                                flexDirection: 'row',
                                justifyContent: 'center',
                                zIndex: 1,
                            }]}>
                                <Text style={styles.outlineButtonTextStyle}>Show </Text>

                                <TouchableOpacity
                                    style={(type === 'all') ? [styles.outlineButtonStyle, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type === 'all') ? "white" : "orange", }] :
                                        [styles.unselectedButtonStyle, { backgroundColor: "lightgray", borderColor: "white", borderBottomColor: "orange" }]}
                                    onPress={() => {
                                        setType("all")
                                    }}
                                >
                                    <Text style={(type === 'all') ? styles.outlineButtonTextStyle : [styles.unselectedButtonTextStyle, { color: "white" }]}>all</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={(type === 'user') ? [styles.outlineButtonStyle, {
                                        borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type === 'user') ? "white" : "orange",
                                    }] :
                                        [styles.unselectedButtonStyle, { backgroundColor: "lightgray", borderColor: "white", borderBottomColor: "orange" }]}
                                    onPress={() => {
                                        setType("user")
                                    }}
                                >
                                    <Text style={(type === 'user') ? styles.outlineButtonTextStyle : [styles.unselectedButtonTextStyle, {
                                        color: "white",
                                    },]}>users</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={(type === 'group' && !isAll) ? [styles.outlineButtonStyle, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type === 'group' && !isAll) ? "white" : "orange", }] :
                                        [styles.unselectedButtonStyle, { backgroundColor: "lightgray", borderColor: "white", borderBottomColor: "orange" }]}
                                    onPress={() => {
                                        setType("group")
                                    }}
                                >
                                    <Text style={(type === 'group' && !isAll) ? styles.outlineButtonTextStyle : [styles.unselectedButtonTextStyle, { color: "white" }]}>groups</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[{
                                position: "relative",
                                bottom: 2,
                                borderBottomWidth: 2,
                                borderColor: "orange",
                                zIndex: 0,
                            }]}>
                            </View>
                            {
                                (type === "group" && groupResults.length === 0) || (type === "user" && userResults.length === 0)
                                    ? <Text style={[styles.outlineButtonTextStyle, { marginTop: 15 }]}>No matching results</Text>
                                    : null
                            }
                        </View>
                        : null
                }
                <APIList
                    ref={ListRef}
                    queryOperation={(type === "group") ? listGroups : listUsers}
                    filter={
                        (type === "group") ?
                            {
                                filter: {
                                    or: [{
                                        name: {
                                            beginsWith: currentQuery.current
                                        }
                                    },
                                    {
                                        Sport: {
                                            contains: currentQuery.current
                                        }
                                    },
                                    {
                                        Description: {
                                            contains: currentQuery.current
                                        }
                                    },]
                                }
                            } :
                            {
                                filter: {
                                    or: [{
                                        name: {
                                            beginsWith: currentQuery.current
                                        }
                                    },
                                    {
                                        bio: {
                                            contains: currentQuery.current
                                        }
                                    },
                                    {
                                        goals: {
                                            contains: currentQuery.current
                                        }
                                    },]
                                }
                            }
                    }
                    ignoreInitialLoad={true}
                    initialAmount={20}
                    additionalAmount={10}
                    setDataFunction={(type === "all") ? [setGroupResults, setUserResults] : (type === "group") ? setGroupResults : setUserResults}
                    data={(type === "all") ? [...userResults, ...groupResults] : (type === "group") ? groupResults : userResults} //wait how would pagination work with sections
                    renderItem={({ item }) =>
                        (item.userID != null)
                            ? <ListGroupItem item={route.params?.updatedGroup == null ? item : route.params?.updatedGroup} matchingname={item.name.startsWith(query)} />
                            : <UserListItem item={item} matchingname={item.name.startsWith(query)} />
                    }
                    keyExtractor={(item, index) => item.id}
                />

                <StatusBar style="auto" />
            </View>
        </TouchableWithoutFeedback>
    );
}