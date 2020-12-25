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
    const [type, setType] = useState("user");
    const currentQuery = useRef();
    const searchBarRef = useRef();
    const ListRef = useRef();

    //still not 100% sure why this works, will have to come back to it. got from here: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
    currentQuery.current = query;

    const formatresults = (items) => {
        let matchingnames = { title: "Matching Names", key: "name", data: (type == "group") ? (groupResults.length == 0 ? [] : groupResults[0].data) : (userResults.length == 0 ? [] : userResults[0].data) }
        let relevantdescriptions = { title: "Relevant Descriptions", key: "desc", data: (type == "group") ? (groupResults.length == 0 ? [] : groupResults[1].data) : (userResults.length == 0 ? [] : userResults[1].data) }
        items.forEach(element => {
            console.log(element.name);
            if (element.name.startsWith(query)) {
                matchingnames.data.push(element);
            } else {
                relevantdescriptions.data.push(element);
            }
        });

        const results = [];
        if (matchingnames.data.length > 0) results.push(matchingnames);
        if (relevantdescriptions.data.length > 0) results.push(relevantdescriptions);

        console.log("finished formatting results: ");
        console.log(results);
        return results;
    }

    useEffect(() => {
        if (query !== "") {
            ListRef.current.fetchDataAsync()
        } else {
            setUserResults([]);
            setGroupResults([]);
        }
    }, [query]);

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
                                    style={(type == 'all') ? [styles.outlineButtonStyle, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type == 'all') ? "white" : "orange", }] :
                                        [styles.unselectedButtonStyle, { backgroundColor: "lightgray", borderColor: "white", borderBottomColor: "orange" }]}
                                    onPress={() => {
                                        setType("all")
                                    }}
                                >
                                    <Text style={(type == 'all') ? styles.outlineButtonTextStyle : [styles.unselectedButtonTextStyle, { color: "white" }]}>all</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={(type == 'user') ? [styles.outlineButtonStyle, {
                                        borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type == 'user') ? "white" : "orange",
                                    }] :
                                        [styles.unselectedButtonStyle, { backgroundColor: "lightgray", borderColor: "white", borderBottomColor: "orange" }]}
                                    onPress={() => {
                                        setType("user")
                                    }}
                                >
                                    <Text style={(type == 'user') ? styles.outlineButtonTextStyle : [styles.unselectedButtonTextStyle, {
                                        color: "white",
                                    },]}>users</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={(type == 'group') ? [styles.outlineButtonStyle, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type == 'group') ? "white" : "orange", }] :
                                        [styles.unselectedButtonStyle, { backgroundColor: "lightgray", borderColor: "white", borderBottomColor: "orange" }]}
                                    onPress={() => {
                                        setType("group")
                                    }}
                                >
                                    <Text style={(type == 'group') ? styles.outlineButtonTextStyle : [styles.unselectedButtonTextStyle, { color: "white" }]}>groups</Text>
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
                                (type == "group" && groupResults.length == 0) || (type == "user" && userResults.length == 0)
                                    ? <Text style={[styles.outlineButtonTextStyle, { marginTop: 15 }]}>No matching results</Text>
                                    : null
                            }
                        </View>
                        : null
                }
                <APIList
                    ref={ListRef}
                    queryOperation={(type == "group") ? listGroups : listUsers}
                    filter={
                        (type == "user") ?
                            {
                                filter: {
                                    or: [{
                                        name: {
                                            beginsWith: query
                                        }
                                    },
                                    {
                                        bio: {
                                            contains: query
                                        }
                                    },
                                    {
                                        goals: {
                                            contains: query
                                        }
                                    },]
                                }
                            }
                            :

                            {
                                filter: {
                                    or: [{
                                        name: {
                                            beginsWith: query
                                        }
                                    },
                                    {
                                        Sport: {
                                            contains: query
                                        }
                                    },
                                    {
                                        Description: {
                                            contains: query
                                        }
                                    },]
                                }
                            }}
                    setDataFunction={(type == "group") ? setGroupResults : setUserResults}
                    data={(type == "group") ? groupResults : userResults} //wait how would pagination work with sections
                    renderItem={({ item }) =>
                        (type == "group")
                            ? <ListGroupItem item={route.params?.updatedGroup == null ? item : route.params?.updatedGroup} />
                            : <UserListItem item={item} />
                    }
                    keyExtractor={(item, index) => item.id}
                />

                <StatusBar style="auto" />
            </View>
        </TouchableWithoutFeedback>
    );
}