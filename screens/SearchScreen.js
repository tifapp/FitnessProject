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
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, Auth, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "root/src/graphql/mutations";
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
    const currentQuery = useRef();
    const searchBarRef = useRef();

    const goGroupCreationScreen = () => {
        navigation.navigate('Create Group')
    }

    //still not 100% sure why this works, will have to come back to it. got from here: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
    currentQuery.current = query;

    const showResultsAsync = async (text) => {
        let items = [];
        /*
        if(mode=="group"){
          console.log("check");
        }
        */

        if (text !== "") {
            const cleanText = text.trim();
            if (type == "group") {
                try {
                    const namematchresult = await API.graphql(
                        graphqlOperation(listGroups, {
                            filter: {
                                name: {
                                    contains: cleanText,
                                },
                            },
                        })
                    );

                    const sportmatchresult = await API.graphql(
                        graphqlOperation(listGroups, {
                            filter: {
                                Sport: {
                                    contains: cleanText,
                                },
                            },
                        })
                    );

                    items = [...sportmatchresult.data.listGroups.items, ...namematchresult.data.listGroups.items];


                    items = items.filter((item, index, self) =>
                        index === self.findIndex((temp) => (
                            temp.id === item.id
                        ))
                    )


                    if (cleanText === currentQuery.current.trim()) {
                        setResults(items);
                        console.log("here's some users! ", cleanText);
                    } else {
                        console.log("ignoring!");
                    }
                } catch (err) {
                    console.log("error: ", err);
                }
            }
            else {
                try {
                    const matchresult = await API.graphql(graphqlOperation(listUsers, {
                        filter: {
                            age: { 
                                ge: (greaterThan || ageHidden) ? (ageHidden ? 18 : selectedAge) : 18,
                                le: (greaterThan || ageHidden) ? 100 : selectedAge,
                            },
                            and: {
                                name: {
                                    beginsWith: cleanText
                                },
                                or: {
                                    bio: {
                                        contains: cleanText
                                    }
                                },
                                or: {
                                    goals: {
                                        contains: cleanText
                                    }
                                }
                            }
                        }
                    }
                    ));

                    matchresult = matchresult.data.listUsers.items;

                    //now separate this into "matching names" and "relevant descriptions" sections by comparing cleanText with the names of each item in matchresult. data should look like this:
                    /*
                    const DATA = [
                    {
                        title: "Main dishes",
                        data: ["Pizza", "Burger", "Risotto"]
                    },
                    {
                        title: "Sides",
                        data: ["French Fries", "Onion Rings", "Fried Shrimps"]
                    },
                    ];
                    */

                    if (location != null) {
                        matchresult.sort((a, b) => {
                            if (a.latitude == null && b.latitude == null) return 0;
                            if (a.latitude == null) return 1;
                            if (b.latitude == null) return -1;
                            return computeDistance([location.latitude, location.longitude], [a.latitude, a.longitude]) - computeDistance([location.latitude, location.longitude], [b.latitude, b.longitude]);
                        })
                    }

                    if (cleanText === currentQuery.current.trim()) {
                        setResults(matchresult);
                        console.log("here's some users! ", cleanText);
                    } else {
                        console.log("ignoring!");
                    }
                } catch (err) {
                    console.log("error: ", err);
                }
            }
        }
        else {
            console.log("check");
            setResults({});
        }
    };

    useEffect(() => {
        showResultsAsync(query);
    }, [query, type, greaterThan, selectedAge, mode, ageHidden]);

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

    function computeDistance([lat1, long1], [lat2, long2]) {
        const prevLatInRad = toRad(lat1);
        const prevLongInRad = toRad(long1);
        const latInRad = toRad(lat2);
        const longInRad = toRad(long2);

        const distance = 6377.830272 *
            Math.acos(
                Math.sin(prevLatInRad) * Math.sin(latInRad) +
                Math.cos(prevLatInRad) * Math.cos(latInRad) * Math.cos(longInRad - prevLongInRad),
            )

        return (
            // In kilometers
            distance.toFixed(0)
        );
    }

    function toRad(angle) {
        return (angle * Math.PI) / 180;
    }

    return (
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
                    placeholder="Search by name or description!"
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
                                style={[(type == 'user') ? styles.outlineButtonStyle : styles.unselectedButtonStyle, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type == 'user') ? "white" : "orange", }]}
                                onPress={() => {
                                    setType("user")
                                }}
                            >
                                <Text style={(type == 'user') ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>users</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[(type == 'group') ? styles.outlineButtonStyle : styles.unselectedButtonStyle, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: (type == 'group') ? "white" : "orange" }]}
                                onPress={() => {
                                    setType("group")
                                }}
                            >
                                <Text style={(type == 'group') ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>groups</Text>
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

            <SectionList
                sections={results}
                renderItem={({ item }) =>
                    (type == "group")
                        ? <ListGroupItem item={route.params?.updatedGroup == null ? item : route.params?.updatedGroup} />
                        : <UserListItem item={item} distance={location == null || item.latitude == null ? 0 : computeDistance([location.latitude, location.longitude], [item.latitude, item.longitude])} />
                }
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.outlineButtonTextStyle}>{title}</Text>
                )}
            />

            <TouchableOpacity style={[styles.submitButton, { position: 'absolute', bottom: 20 }]} onPress={goGroupCreationScreen}>
                <Text style={styles.buttonTextStyle}>Create Group</Text>
            </TouchableOpacity>

            <StatusBar style="auto" />
        </View>
    );
}