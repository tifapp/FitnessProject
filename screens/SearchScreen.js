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
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listGroups } from "root/src/graphql/queries";
import { listUsers } from "root/src/graphql/queries";
import Header from "components/header";
import UserListItem from "components/UserListItem";
import ListGroupItem from "components/ListGroupItem";
import * as subscriptions from "root/src/graphql/subscriptions";
import AgePicker from "components/basicInfoComponents/AgePicker";
import { MaterialIcons } from '@expo/vector-icons';
import APIList from 'components/APIList';

var styles = require("styles/stylesheet");

export default function SearchScreen({ navigation, route }) {
    const [query, setQuery] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [groupResults, setGroupResults] = useState([]);
    const [searchType, setSearchType] = useState("all"); //refreshing tho
    const searchBarRef = useRef();
    const UserListRef = useRef();
    const GroupListRef = useRef();
    const PostListRef = useRef();
    const currentQuery = useRef();

    currentQuery.current = query.toLowerCase();

    useEffect(() => {
        if (query !== "") {
            UserListRef.current.fetchDataAsync(true, () => {
                return (currentQuery.current !== query.toLowerCase() || query === "")
            })
            GroupListRef.current.fetchDataAsync(true, () => {
                return (currentQuery.current !== query.toLowerCase() || query === "")
            })
        } else {
            setUserResults([]);
            setGroupResults([]);
        }
    }, [query]);

    const emptyComponent = React.useCallback(() =>
        <Text style={{
            marginTop: 15,
            fontSize: 16,
            color: "black",
            alignSelf: "center",
            marginBottom: 2,
            marginHorizontal: 6,
            fontWeight: "bold",
        }}>
            No matching results
        </Text>
        , [])

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ backgroundColor: "#a9efe0", flex: 1 }}>
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
                        autoFocus={true}
                        ref={searchBarRef}
                        style={[styles.textInputStyle, { flexGrow: 1 }]}
                        placeholder="Search for names or keywords!"
                        onChangeText={(text) => {
                            setQuery(text.trim());
                        }}
                        value={query}
                        clearButtonMode="always"
                    />
                    <MaterialIcons name="search" size={28} color="gray"
                        style={[{ marginRight: 10 }]} />
                </TouchableOpacity>

                {
                    query !== ""
                        ?
                        <View style={[styles.spacingTop, {
                            flexDirection: 'row',
                            justifyContent: 'center',
                            zIndex: 1,
                        }]}>
                            <Tab
                                label={"All"}
                                onPress={() => {
                                    setSearchType("all")
                                }}
                                isSelected={(searchType === 'all')}
                            />
                            <Tab
                                label={"Users"}
                                onPress={() => {
                                    setSearchType("user")
                                }}
                                isSelected={(searchType === 'user')}
                            />
                            <Tab
                                label={"Groups"}
                                onPress={() => {
                                    setSearchType("group")
                                }}
                                isSelected={(searchType === 'group')}
                            />
                        </View>
                        : null
                }
                <APIList
                    ref={UserListRef}
                    queryOperation={listUsers}
                    ListHeaderComponent={
                        searchType === "all" && query.length > 0 ?
                        <Text style={{
                            marginTop: 15,
                            fontSize: 20,
                            color: "black",
                            alignSelf: "center",
                            marginBottom: 2,
                            marginHorizontal: 6,
                            fontWeight: "bold",
                        }}>
                            Users
                        </Text>
                        : null
                    }
                    ListEmptyComponent={
                        (searchType === "user" || searchType === "all") && query.length > 0 ?
                        emptyComponent : null
                    }
                    filter={
                        {
                            filter: {
                                or: [{
                                    name: {
                                        beginsWith: currentQuery.current
                                    }
                                },{
                                    status: {
                                        beginsWith: currentQuery.current
                                    }
                                },
                                {
                                    name: {
                                        contains: " " + currentQuery.current
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
                    initialAmount={10}
                    additionalAmount={20}
                    setDataFunction={setUserResults}
                    data={(searchType === "user" || searchType === "all") && query.length > 0 ? userResults : []} //wait how would pagination work with sections
                    renderItem={({ item }) =>
                        <UserListItem item={item} matchingname={item.name.startsWith(query)} />
                    }
                    keyExtractor={(item) => item.id}
                    style={{ backgroundColor: "#a9efe0", flex: (searchType === "user" || searchType === "all") && query.length > 0 && userResults.length > 0 ? 1 : 0 }}
                />
                <APIList
                    ref={GroupListRef}
                    queryOperation={listGroups}
                    ListHeaderComponent={
                        searchType === "all" && query.length > 0 ?
                        <Text style={{
                            marginTop: 15,
                            fontSize: 20,
                            color: "black",
                            alignSelf: "center",
                            marginBottom: 2,
                            marginHorizontal: 6,
                            fontWeight: "bold",
                        }}>
                            Groups
                        </Text>
                        : null
                    }
                    ListEmptyComponent={
                        (searchType === "group" || searchType === "all") && query.length > 0 ?
                        emptyComponent : null
                    }
                    filter={
                        {
                            filter: {
                                or: [{
                                    name: {
                                        beginsWith: currentQuery.current
                                    }
                                }, {
                                    name: {
                                        contains: " " + currentQuery.current
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
                        }
                    }
                    ignoreInitialLoad={true}
                    initialAmount={10}
                    additionalAmount={20}
                    setDataFunction={setGroupResults}
                    data={(searchType === "group" || searchType === "all") && query.length > 0 ? groupResults : []} //wait how would pagination work with sections
                    renderItem={({ item }) =>
                        <ListGroupItem item={route.params?.updatedGroup == null ? item : route.params?.updatedGroup} matchingname={item.name.startsWith(query)} />
                    }
                    keyExtractor={(item) => item.id}
                    style={{ backgroundColor: "#a9efe0", flex: (searchType === "group" || searchType === "all") && query.length > 0 && groupResults.length > 0 ? 1 : 0 }}
                />
            </View>
        </TouchableWithoutFeedback>
    );
}

function Tab({ label, onPress, isSelected }) {
    return (
        <TouchableOpacity
            style={{
                borderBottomWidth: isSelected ? 3 : 0,
                backgroundColor: "transparent",
                padding: 9,
                marginHorizontal: 10,
                marginBottom: isSelected ? 12 : 0,
            }}
            onPress={onPress}
        >
            <Text style={{
                color: isSelected ? "black" : "gray",
                alignSelf: "center",
                marginBottom: 2,
                marginHorizontal: 6,
                fontWeight: "bold",
                fontSize: 20,
            }}>{label}</Text>
        </TouchableOpacity>
    )
}