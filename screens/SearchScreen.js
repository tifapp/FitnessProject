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
import { listUsers } from "root/src/graphql/queries";
import Header from "components/header";
import AddPost from "components/AddPosts";
import UserListItem from "components/UserListItem";
import ListGroupItem from "components/ListGroupItem";
import * as subscriptions from "root/src/graphql/subscriptions";
import AgePicker from "components/basicInfoComponents/AgePicker";

Amplify.configure(awsconfig);

var styles = require("styles/stylesheet");

export default function GroupSearchScreen({ navigation }) {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [mode, setMode] = useState("user");
    const [greaterThan, setGreaterThan] = useState(true);
    const [selectedAge, setSelectedAge] = useState(18);
    const [userMode, setUserMode] = useState("name");
    const stateRef = useRef();

    const goGroupCreationScreen = () => {
        navigation.navigate('Create Group')
    }

    //still not 100% sure why this works, will have to come back to it. got from here: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
    stateRef.current = query;

    const showUsersAsync = async (text) => {
        let items = [];
        /*
        if(mode=="group"){
          console.log("check");
        }
        */

        if (text !== "") {
            const cleanText = text.trim();
            if (mode == "group") {
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


                    if (cleanText === stateRef.current.trim()) {
                        setUsers(items);
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
                    let matchresult;
                    if (userMode == 'name') {
                        if (greaterThan) {
                            const namematchresult = await API.graphql(graphqlOperation(listUsers, {
                                filter: {
                                    age: { ge: selectedAge },
                                    and: {
                                        name: {
                                            beginsWith: cleanText
                                        }
                                    }
                                }
                            }
                            ));
                            matchresult = namematchresult.data.listUsers.items;
                        } else {
                            const namematchresult = await API.graphql(graphqlOperation(listUsers, {
                                filter: {
                                    age: { le: selectedAge },
                                    and: {
                                        name: {
                                            beginsWith: cleanText
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
                                    age: { ge: selectedAge },
                                    and: {
                                        bio: {
                                            contains: cleanText
                                        }
                                    }
                                }
                            }
                            ));
                            goalsmatchresult = await API.graphql(graphqlOperation(listUsers, {
                                filter: {
                                    age: { ge: selectedAge },
                                    and: {
                                        goals: {
                                            contains: cleanText
                                        }
                                    }
                                }
                            }
                            ));
                        } else {

                            biomatchresult = await API.graphql(graphqlOperation(listUsers, {
                                filter: {
                                    age: { le: selectedAge },
                                    and: {
                                        bio: {
                                            contains: cleanText
                                        }
                                    }
                                }
                            }
                            ));
                            goalsmatchresult = await API.graphql(graphqlOperation(listUsers, {
                                filter: {
                                    age: { le: selectedAge },
                                    and: {
                                        goals: {
                                            contains: cleanText
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

                    if (cleanText === stateRef.current.trim()) {
                        setUsers(matchresult);
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
            setUsers([]);
        }
    };

    useEffect(() => {
        showUsersAsync(query);
    }, [query, mode, greaterThan, selectedAge, userMode]);

    return (
        <View style={styles.containerStyle}>
            <View style={styles.spacingTop}>
                <TouchableOpacity
                    style={styles.outlineButtonStyle}
                    onPress={() => {
                        if (mode == "user")
                            setMode("group")
                        else
                            setMode("user")
                    }}
                >
                    <Text style={styles.outlineButtonTextStyle}>{mode}</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={[styles.textInputStyle, { marginTop: 40 }]}
                placeholder="Start Typing ..."
                onChangeText={setQuery}
                value={query}
                clearButtonMode="always"
            />

            {(mode == "user") ?
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginBottom: 15,
                }}>
                    <TouchableOpacity
                        style={styles.outlineButtonStyle}
                        onPress={() => {
                            if (userMode == 'name')
                                setUserMode('description');
                            else
                                setUserMode('name');
                        }}
                    >
                        <Text style={styles.outlineButtonTextStyle}>{userMode}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.outlineButtonStyle}
                        onPress={() => {
                            setGreaterThan(!greaterThan);
                        }}
                    >
                        <Text style={styles.outlineButtonTextStyle}>{greaterThan ? 'age >=' : 'age <='}</Text>
                    </TouchableOpacity>
                    <AgePicker field={''} selectedValue={selectedAge} setSelectedValue={setSelectedAge} />
                </View>
                : null
            }

            {(mode == "group") ?
                <FlatList
                    data={users}
                    renderItem={({ item }) => <ListGroupItem item={item} />}
                />
                :
                <FlatList
                    data={users}
                    renderItem={({ item }) => <UserListItem item={item} />}
                //if there are only 1 or 2 characters in the query, dont load images
                //if there are more than 5 search results only download images from the top 5 (paginate)
                />
            }

            <TouchableOpacity style={styles.submitButton} onPress={goGroupCreationScreen}>
                <Text style={styles.buttonTextStyle}>Create Group</Text>
            </TouchableOpacity>

            <StatusBar style="auto" />
        </View>
    );
}