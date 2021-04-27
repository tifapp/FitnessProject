import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import ProfilePic from 'components/ProfileImagePicker'
import BasicInfo from 'components/basicInfoComponents/BasicInfo'
import DetailedInfo from 'components/detailedInfoComponents/DetailedInfo';
import useUserDatabase from 'hooks/useUserDatabase';
import { Auth } from "aws-amplify";
import { Platform } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import CheckBox from '@react-native-community/checkbox'; //when ios is supported, we'll use this
import getLocation from 'hooks/useLocation';
import APIList from 'components/APIList';
import { ProfileImageAndName } from "components/ProfileImageAndName";
import { listBlocks } from "root/src/graphql/queries";
import { deleteBlock } from "root/src/graphql/mutations";

var styles = require('styles/stylesheet');

const SettingsScreen = ({ navigation, route }) => {
    const [blockList, setBlockList] = useState([]);
    
    const unblock = async (userId) => {
        await API.graphql(graphqlOperation(deleteBlock, { input: { blockee: userId } }));
    }

    return(
    <APIList
        initialAmount={10}
        additionalAmount={20}
        queryOperation={listBlocks}
        data={blockList}
        setDataFunction={setBlockList}
        renderItem={({ item }) => (
            <View
            style={{
                flexDirection: "row",
                alignSelf: "center",
                marginVertical: 5,
                justifyContent: "space-between",
            }}
            >
            <ProfileImageAndName
                imageStyle={[
                styles.smallImageStyle,
                { marginHorizontal: 20 },
                ]}
                userId={item.blockee}
            />
            
            <Text>
                {item.createdAt}
            </Text>

            <TouchableOpacity
                onPress={() => unblock(item.blockee)}>
                        <Text>
                            unblock //then ask to verify the unblocking, like with friend requests
                            //should disappear from the list when confirming, or just fade out? maybe jump to bottom with the option to reblock that person
                        </Text>
            </TouchableOpacity>
            </View>
        )}
        keyExtractor={(item) => item.blockee}
    />);
}

export default SettingsScreen;