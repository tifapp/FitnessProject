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
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

Amplify.configure(awsconfig);

var styles = require("styles/stylesheet");

export default function GroupSearchScreen({ navigation, route }) {
    const [location, setLocation] = useState(null); //object with latitude and longitude properties
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({});
    const [type, setType] = useState("user");
    const [mode, setMode] = useState("name");
    const [greaterThan, setGreaterThan] = useState(true);
    const [selectedAge, setSelectedAge] = useState(18);
    const [ageHidden, setAgeHidden] = useState(true);
    const [loading, setLoading] = useState(false);
    const currentQuery = useRef();
    const searchBarRef = useRef();

    const goGroupCreationScreen = () => {
        navigation.navigate('Create Group')
    }

    //still not 100% sure why this works, will have to come back to it. got from here: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
    currentQuery.current = query;

    const formatresults = (cleanText, items) => {
        let matchingnames = { title: "Matching Names", key: "name", data: [] }
        let relevantdescriptions = { title: "Relevant Descriptions", key: "desc", data: [] }
        items.forEach(element => {
            console.log(element.name);
            if (element.name.startsWith(cleanText)) {
                matchingnames.data.push(element);
            } else {
                relevantdescriptions.data.push(element);
            }
        });

        const allresults = [];
        if (matchingnames.data.length > 0) allresults.push(matchingnames);
        if (relevantdescriptions.data.length > 0) allresults.push(relevantdescriptions);

        if (cleanText === currentQuery.current.trim()) {
            setResults(allresults);
            console.log("here's some results! ", cleanText);
        } else {
            console.log("ignoring!");
        }
    }

    const showResultsAsync = async (text) => {
        let items = [];
        /*
        if(mode=="group"){
          console.log("check");
        }
        */

        if (text !== "") {
            setLoading(true);
            const cleanText = text.trim();
            if (type == "group") {
                try {
                    const unformattedresults = await API.graphql(
                        graphqlOperation(listGroups, {
                            filter: {
                                not: {
                                    and: {
                                        not: {
                                            name: {
                                                beginsWith: cleanText
                                            }
                                        },
                                        and: {
                                            not: {
                                                Sport: {
                                                    contains: cleanText
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                        })
                    );

                    formatresults(cleanText, unformattedresults.data.listGroups.items);
                } catch (err) {
                    formatresults(cleanText, err.data.listGroups.items);
                    console.log("error: ", err);
                }
            }
            else {
                try {
                    //for some darn reason the or operator doesn't work. and works, not works, but not OR!!!! So I have to use these dumb demorgans laws.
                    //also case insensitive search does not work for some reason.
                    const unformattedresults = await API.graphql(graphqlOperation(listUsers, {
                        filter: {
                            not: {
                                and: {
                                    not: {
                                        name: {
                                            beginsWith: cleanText
                                        }
                                    },
                                    and: {
                                        not: {
                                            and: {
                                                bio: {
                                                    contains: cleanText
                                                }
                                            },
                                            not: {
                                                goals: {
                                                    contains: cleanText
                                                }
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                    ));

                    formatresults(cleanText, unformattedresults.data.listUsers.items);
                } catch (err) {
                    formatresults(cleanText, err.data.listUsers.items);
                    console.log("error while searching: ", err);
                }
            }
        }
        else {
            console.log("check");
            setResults({});
        }
        setLoading(false);
    };

    useEffect(() => {
        showResultsAsync(query);
    }, [query, greaterThan, selectedAge, type, mode, ageHidden]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
            }

            let location = await Location.getCurrentPositionAsync({ accuracy: 2 });
            setLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        })();
    }, []);

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
                    onChangeText={setQuery}
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
                    : results.length > 0
                        ? <SectionList
                            style={{ marginBottom: 80 }}
                            sections={results}
                            renderItem={({ item }) =>
                                (type == "group")
                                    ? <ListGroupItem item={route.params?.updatedGroup == null ? item : route.params?.updatedGroup} />
                                    : <UserListItem item={item} location={location} />
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

            <TouchableOpacity style={[styles.submitButton, { position: 'absolute', bottom: 20 }]} onPress={goGroupCreationScreen}>
                <Text style={styles.buttonTextStyle}>Create Group</Text>
            </TouchableOpacity>

            <StatusBar style="auto" />
        </View>
        </TouchableWithoutFeedback>
    );
}