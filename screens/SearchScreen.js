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
    SectionList,
    ActivityIndicator,
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, Auth, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost, createFriend } from "root/src/graphql/mutations";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listGroups } from "root/src/graphql/queries";
import { listUsers } from "root/src/graphql/queries";
import Header from "components/header";
import AddPost from "components/AddPosts";
import UserListItem from "components/UserListItem";
import ListGroupItem from "components/ListGroupItem";
import * as subscriptions from "root/src/graphql/subscriptions";
import AgePicker from "components/basicInfoComponents/AgePicker";
import { MaterialCommunityIcons } from '@expo/vector-icons';

Amplify.configure(awsconfig);

var styles = require("styles/stylesheet");

export default function GroupSearchScreen({ navigation, route }) {
    const [query, setQuery] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [groupResults, setGroupResults] = useState([]);
    const [type, setType] = useState("user");
    const [loading, setLoading] = useState(false);
    const currentQuery = useRef();
    const searchBarRef = useRef();

    //still not 100% sure why this works, will have to come back to it. got from here: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
    currentQuery.current = query;

    const fetchUserResultsAsync = async (nextToken, showNextToken) => {
        try {
            //for some darn reason the or operator doesn't work. and works, not works, but not OR!!!! So I have to use these dumb demorgans laws.
            //also case insensitive search does not work for some reason.
            const unformattedresults = await API.graphql(graphqlOperation(listUsers, {
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
            })
            );
            return unformattedresults.data.listUsers.items;
        } catch (err) {
            console.log("error while searching: ", err);
            return err.data.listUsers.items;
        }
    }
    
    const fetchGroupResultsAsync = async (nextToken, showNextToken) => {
        try {
            const unformattedresults = await API.graphql(
                graphqlOperation(listGroups, {
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
                        }]
                    },
                })
            );

            console.log("group items are ", unformattedresults.data.listGroups.items);
            return unformattedresults.data.listGroups.items;
        } catch (err) {
            console.log("error while searching: ", err);
            //return err.data.listGroups.items; //since some users have string ages rather than int ages
        }
    }
    
    const formatresults = (items) => {
        let matchingnames = { title: "Matching Names", key: "name", data: [] }
        let relevantdescriptions = { title: "Relevant Descriptions", key: "desc", data: [] }
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

        return results;
    }

    useEffect(() => {        
        if (query !== "") {
            setLoading(true);
            (async () => {
                if (type == "group") {
                    return fetchGroupResultsAsync();
                } else if (type == "user") {
                    return fetchUserResultsAsync();
                } else {
                    //return fetchAllResultsAsync();
                }
            })()
            .then(results => {
                if (results != null && query === currentQuery.current) {
                    if (type == "group") {
                        setGroupResults(formatresults(results));
                    } else if (type == "user") {
                        setUserResults(formatresults(results));
                    } else {
                    }
                }
                else {
                    console.log("ignoring!");
                }
            }).finally(()=>{
                setLoading(false)
            });
        } else {            
            setUserResults([]);
            setGroupResults([]);
        }
    }, [query, type]);

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
                                [styles.unselectedButtonStyle, {backgroundColor: "lightgray", borderColor: "white", borderBottomColor: "orange"}]}
                                onPress={() => {
                                    setType("all")
                                }}
                            >
                                <Text style={(type == 'all') ? styles.outlineButtonTextStyle : [styles.unselectedButtonTextStyle, {color: "white"}]}>all</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={(type == 'user') ? [styles.outlineButtonStyle, { 
                                    borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type == 'user') ? "white" : "orange", }] : 
                                [styles.unselectedButtonStyle, {backgroundColor: "lightgray", borderColor: "white", borderBottomColor: "orange"}]}
                                onPress={() => {
                                    setType("user")
                                }}
                            >
                                <Text style={(type == 'user') ? styles.outlineButtonTextStyle : [styles.unselectedButtonTextStyle, {color: "white",
                            },]}>users</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={(type == 'group') ? [styles.outlineButtonStyle, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type == 'group') ? "white" : "orange", }] : 
                                [styles.unselectedButtonStyle, {backgroundColor: "lightgray", borderColor: "white", borderBottomColor: "orange"}]}
                                onPress={() => {
                                    setType("group")
                                }}
                            >
                                <Text style={(type == 'group') ? styles.outlineButtonTextStyle : [styles.unselectedButtonTextStyle, {color: "white"}]}>groups</Text>
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
                    </View>
                    : null
            }

            {
                loading
                    ? <ActivityIndicator
                        size="large"
                        color="#0000ff"
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            flexDirection: "row",
                            justifyContent: "space-around",
                            padding: 10,
                        }} />
                    : (type == "group" && groupResults.length > 0) || (type == "user" && userResults.length > 0)
                        ? <SectionList
                            style={{ marginBottom: 80 }}
                            sections={(type == "group") ? groupResults : userResults}
                            renderItem={({ item }) =>
                                (type == "group")
                                    ? <ListGroupItem item={route.params?.updatedGroup == null ? item : route.params?.updatedGroup} />
                                    : <UserListItem item={item} />
                            }
                            renderSectionHeader={({ section: { title } }) => (
                                <Text style={[styles.outlineButtonTextStyle, { marginTop: 15 }]}>{title}</Text>
                            )}
                            stickySectionHeadersEnabled={true}
                            keyExtractor={(item, index) => item.id}
                        />
                        : query !== "" 
                            ? <Text style={[styles.outlineButtonTextStyle, { marginTop: 15 }]}>No matching results</Text>
                            : null
            }

            <StatusBar style="auto" />
        </View>
        </TouchableWithoutFeedback>
    );
}