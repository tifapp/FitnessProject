import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
} from "react-native";
import ProfilePic from "components/ProfileImagePicker";
import BasicInfo from "components/basicInfoComponents/BasicInfo";
import DetailedInfo from "components/detailedInfoComponents/DetailedInfo";
import useUserDatabase from "hooks/useUserDatabase";
import { Auth } from "aws-amplify";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CheckBox from "@react-native-community/checkbox"; //when ios is supported, we'll use this
import getLocation from "hooks/useLocation";
import APIList from "components/APIList";
import { ProfileImageAndName } from "components/ProfileImageAndName";
import { blocksByDate } from "root/src/graphql/queries";
import { deleteBlock } from "root/src/graphql/mutations";
import printTime from "hooks/printTime";
import { API, graphqlOperation } from "aws-amplify";

var styles = require("styles/stylesheet");

const SettingsScreen = ({ navigation, route }) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [blockList, setBlockList] = useState([]);
  
  const alertOptions = {
    cancelable: true,
    onDismiss: () => setIsOptionsOpen(false),
  };

  const unblock = async (blockeeId) => {
    const title = "Are you sure you want to unblock this friend?";
    const options = [
      {
        text: "Yes",
        onPress: () => {
          console.log("about to delete this user: ", blockeeId)
          setBlockList(blockList.filter((item) => item.blockee != blockeeId));
          API.graphql(
            graphqlOperation(deleteBlock, { input: { userId: route.params?.myId, blockee: blockeeId} })
          );
        },
      },
      {
        text: "Cancel",
        type: "cancel",
        onPress: () => {
          setIsOptionsOpen(false);
        },
      },
    ];
    Alert.alert(title, "", options, alertOptions);
  };

  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      console.log("got to settings", global.localBlockList);
      console.log("got to settings", blockList);
      setBlockList([...blockList, ...global.localBlockList]);
      global.localBlockList = [];
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return onFocus;
  }, [navigation])

  return (
    <APIList
      initialAmount={10}
      additionalAmount={20}
      queryOperation={blocksByDate}
      data={blockList}
      setDataFunction={setBlockList}
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: "row",
            alignSelf: "flex-start",
            alignItems: "center",
            marginVertical: 5,
            justifyContent: "space-evenly",
          }}
        >
          <ProfileImageAndName
            imageStyle={[styles.smallImageStyle, { marginHorizontal: 20 }]}
            userId={item.blockee}
            
            sibling={
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  flex: 1,
                  marginHorizontal: 30,
                }}
              >
              <Text style={{marginHorizontal: 16, color: "gray"}}>{printTime(item.createdAt)}</Text>
    
              <TouchableOpacity onPress={() => unblock(item.blockee, item.createdAt)}>
                <Text>
                  unblock
                  {
                    //then ask to verify the unblocking, like with friend requests
                    //should disappear from the list when confirming, or just fade out? maybe jump to bottom with the option to reblock that person
                  }
                </Text>
              </TouchableOpacity>
              </View>
            }
          />
        </View>
      )}
      nonRefreshable={true}
      filter={{ userId: route.params?.myId }}
      contentContainerStyle={{ flexGrow: 1, flex: 1, justifyContent: 'center', alignContent: "center", alignItems: "center", alignSelf: "center", }}
      keyExtractor={(item) => item.blockee}
      ListEmptyComponent={
        <Text
        style={{
          alignSelf: "center",
          justifyContent: "center",
          color: "gray",
          marginVertical: 30,
          fontSize: 15,
        }}>
          You haven't blocked anyone.
        </Text>
      }
    />
  );
};

export default SettingsScreen;
