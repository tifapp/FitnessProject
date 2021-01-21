import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
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
    RefreshControl
} from "react-native";
import { listGroups } from "root/src/graphql/queries";
import { API, Auth, graphqlOperation } from "aws-amplify";
import ListGroupItem from "components/ListGroupItem";

var styles = require("styles/stylesheet");

export default function MyGroups({navigation, route}) {
    
    const [users, setUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    
    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
    }, []);
    //const stateRef = useRef();
    //const [query, setQuery] = useState("");
    //const { id } = route.params.id;
    //console.log(id);

    const showResultsAsync = async () => {
        let items = [];
        try{
            const namematchresult = await API.graphql(
                graphqlOperation(listGroups, {
                    filter: {
                        userID: {
                            eq: route.params?.id
                        }
                    }
                })
            );
            items = [...namematchresult.data.listGroups.items];
            setUsers(items);
        }
        catch(err){
            console.log("error: ", err);
        }
        setUsers(items);
        setRefreshing(false);
    };

    useEffect(() => {
        showResultsAsync();
      });

    return (
        <View>
            <View style={styles.header}>
                <Text style={styles.title}>My Groups</Text>
            </View>
            <View>
            <FlatList
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    data={users}
                    renderItem={({ item }) => <ListGroupItem item={item} />}
            />
            </View>
            
            <TouchableOpacity style={[styles.submitButton]} onPress={() => navigation.navigate('Create Group')}>
                <Text style={styles.buttonTextStyle}>Create Group</Text>
            </TouchableOpacity>
        </View>
    );
};