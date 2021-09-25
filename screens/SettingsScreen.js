import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
  LayoutAnimation
} from "react-native";
import { updateUser } from "root/src/graphql/mutations";
import { getUser } from 'root/src/graphql/queries'
import { API, graphqlOperation } from "aws-amplify";

var styles = require("styles/stylesheet");

const SettingsScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFriendRequestsEnabled, setIsFriendRequestsEnabled] = useState(false);
  const [isMessagesEnabled, setIsMessagesEnabled] = useState(false);

  useEffect(async () => {
    const user = await API.graphql(graphqlOperation(getUser, { id: route.params?.myId }));
    if (user.data.getUser.friendRequestPrivacy) {
      setIsFriendRequestsEnabled(true);
    }
    if (user.data.getUser.messagesPrivacy) {
      setIsMessagesEnabled(true);
    }
    setIsLoading(false);
  }, [])

  if (isLoading) return null;
  else return (
    <View>
      <Text style={{
        fontSize: 18,
        color: "black",
      }}>Privacy</Text>
      <View style={{flexDirection: "row"}}>
        <APISwitch
          initialState={false}
          apicall={            
            () => 
            API.graphql(
              graphqlOperation(updateUser, { input: { friendRequestPrivacy: isFriendRequestsEnabled } })
            )
          }
        />
        <Text
          style={{
            fontSize: 16,
          }}
        >
          Allow strangers to message you
        </Text>
      </View>
      <View style={{flexDirection: "row"}}>
        <APISwitch
          initialState={false}
          apicall={            
            () => 
            API.graphql(
              graphqlOperation(updateUser, { input: { messagesPrivacy: isMessagesEnabled } })
            )
          }
        />
        <Text
          style={{
            fontSize: 16,
          }}
        >
          Allow strangers to send you friend requests (will still allow mutual friends)
        </Text>
      </View>
    </View>
  );
};

function APISwitch({ initialState, apicall }) {
  const [isEnabled, setIsEnabled] = useState(initialState); //should fetch from backend
  const enabledRef = useRef();
  const timerIsRunning = useRef();
  const enabledTimeout = useRef();

  const resetTimeout = () => {
    //if there's already a timeout running do not update ref
    //if there isn't, update ref
    if (!timerIsRunning.current) {
      enabledRef.current = isEnabled;
    }
    timerIsRunning.current = true;
    clearTimeout(enabledTimeout.current);
    enabledTimeout.current = setTimeout(sendAPICall, 1000);
  };

  const sendAPICall = () => {
    if (isEnabled == enabledRef.current) {
      //console.log("sent API call, hopefully debounce works.");
      apicall();
    }

    timerIsRunning.current = false;
  };

  const toggleAsync = async () => {
    //liked ? playSound("unlike") : playSound("like");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      setIsEnabled(!isEnabled);
      resetTimeout();
    } catch (err) {
      console.log(err);
      alert("Could not be submitted!");
    }
  };

  return (
    <Switch
      trackColor={{ false: "#efefef", true: "#26c6a2" }}
      thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
      ios_backgroundColor="#3e3e3e"
      onValueChange={toggleAsync}
      value={isEnabled}
    />
  );
}

export default SettingsScreen;
