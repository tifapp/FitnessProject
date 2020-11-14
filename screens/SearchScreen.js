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
import * as Location from 'expo-location';

Amplify.configure(awsconfig);

var styles = require("styles/stylesheet");

export default function GroupSearchScreen({ navigation}) {
    const [location, setLocation] = useState(null); //object with latitude and longitude properties
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [type, setType] = useState("user");
    const [mode, setMode] = useState("name");
    const [greaterThan, setGreaterThan] = useState(true);
    const [selectedAge, setSelectedAge] = useState(18);
    const [ageHidden, setAgeHidden] = useState(true);
    const stateRef = useRef();

    const goGroupCreationScreen = () => {
        navigation.navigate('Create Group')
    }

    //still not 100% sure why this works, will have to come back to it. got from here: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
    stateRef.current = query;

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


                    if (cleanText === stateRef.current.trim()) {
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
                    let matchresult;
                    if (mode == 'name') {
                        if (greaterThan || ageHidden) {
                            const namematchresult = await API.graphql(graphqlOperation(listUsers, {
                                filter: {
                                    age: { ge: ageHidden ? 18 : selectedAge },
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
                        if (greaterThan || ageHidden) {

                            biomatchresult = await API.graphql(graphqlOperation(listUsers, {
                                filter: {
                                    age: { ge: ageHidden ? 18 : selectedAge },
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
                                    age: { ge: ageHidden ? 18 : selectedAge },
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

                        if (location != null) {
                            matchresult.sort((a, b) => {
                                if (isNaN(a.latitude) && isNaN(b.latitude)) return 0;
                                if (isNaN(a.latitude)) return 1;
                                if (isNaN(b.latitude)) return -1;
                                return computeDistance([location.latitude, location.longitude], [a.latitude, a.longitude]) - computeDistance([location.latitude, location.longitude], [b.latitude, b.longitude]);
                            })
                        }
                    }

                    if (cleanText === stateRef.current.trim()) {
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
            setResults([]);
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
            setLocation({latitude: location.coords.latitude, longitude: location.coords.longitude});
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
            <View style={[styles.spacingTop, {
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: 15,
            }]}>
                <Text style={styles.outlineButtonTextStyle}>Search for:</Text>
                <TouchableOpacity
                    style={(type == 'user') ? styles.outlineButtonStyle : styles.unselectedButtonStyle}
                    onPress={() => {
                        setType("user")
                    }}
                >
                    <Text style={(type == 'user') ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(type == 'group') ? styles.outlineButtonStyle : styles.unselectedButtonStyle}
                    onPress={() => {
                        setType("group")
                    }}
                >
                    <Text style={(type == 'group') ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>groups</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={[styles.textInputStyle, { marginTop: 40 }]}
                placeholder="Start Typing ..."
                onChangeText={setQuery}
                value={query}
                clearButtonMode="always"
            />

            {(type == "user") ?
                <View>
                    <View style={[styles.spacingTop, {
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginBottom: 15,
                    }]}>
                        <Text style={styles.outlineButtonTextStyle}>Search by:</Text>
                        <TouchableOpacity
                            style={(mode == 'name') ? styles.outlineButtonStyle : styles.unselectedButtonStyle}
                            onPress={() => {
                                setMode("name")
                            }}
                        >
                            <Text style={(mode == 'name') ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>name</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={(mode == 'description') ? styles.outlineButtonStyle : styles.unselectedButtonStyle}
                            onPress={() => {
                                setMode("description")
                            }}
                        >
                            <Text style={(mode == 'description') ? styles.outlineButtonTextStyle : styles.unselectedButtonTextStyle}>description</Text>
                        </TouchableOpacity>
                    </View>
                    {
                        ageHidden ?
                        <View style={[styles.spacingTop, {
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginBottom: 15,
                        }]}>
                            <TouchableOpacity
                                onPress={() => {
                                    setAgeHidden(false);
                                }}
                            >
                                <Text style={styles.unselectedButtonTextStyle}>+ Add Age Filter</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        <View style={[styles.spacingTop, {
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 15,
                        }]}>
                            <TouchableOpacity
                                onPress={() => {
                                    setAgeHidden(true);
                                }}
                            >
                                <Text style={styles.unselectedButtonTextStyle}>- Remove Filter</Text>
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
                    }
                </View>
                : null
            }

            {(type == "group") ?
                <FlatList
                    data={results}
                    renderItem={({ item }) => <ListGroupItem item={item} />}
                />
                :
                <FlatList
                    data={results}
                    renderItem={({ item }) => <UserListItem item={item} distance={location == null || isNaN(item.latitude) ? 0 : computeDistance([location.latitude, location.longitude], [item.latitude, item.longitude])} />}
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