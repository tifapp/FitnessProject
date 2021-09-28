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
import * as Haptics from "expo-haptics";

var styles = require("styles/stylesheet");

const SettingsScreen = ({ navigation, route }) => {
  const [previousSettings, setPreviousSettings] = useState();

  useEffect(() => {
    (async() => {
      //console.log("your id is ", route.params?.myId)
      const user = await API.graphql(graphqlOperation(getUser, { id: route.params?.myId }));
      //console.log(user.data.getUser);
      setPreviousSettings(user.data.getUser);
    })();
  }, [])

  if (!previousSettings) return null;
  else return (
    <View
    style={{
      margin: 16,
    }}>
      <Text style={{
        fontSize: 20,
        color: "black",
        marginBottom: 18,
      }}>Privacy</Text>
        <APISwitch
          initialState={previousSettings.messagesPrivacy}
          apicall={            
            (enabled) => 
            API.graphql(
              graphqlOperation(updateUser, { input: { friendRequestPrivacy: enabled } })
            )
          }
          label="Don't allow strangers to send you friend requests (will still allow mutual friends)"
        />
        <APISwitch
          initialState={previousSettings.friendRequestPrivacy}
          apicall={            
            (enabled) => 
            API.graphql(
              graphqlOperation(updateUser, { input: { messagesPrivacy: enabled } })
            )
          }
          label="Don't allow strangers to message you"
        />
    </View>
  );
};

function APISwitch({ initialState, apicall, label }) {
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
      apicall(!isEnabled);
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
    <View style={{flexDirection: "row", marginBottom: 8, alignItems: "center"}}>
    <Switch
      trackColor={{ false: "#efefef", true: "#26c6a2" }}
      thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
      ios_backgroundColor="#3e3e3e"
      onValueChange={toggleAsync}
      value={isEnabled}
    />
    <Text
      style={{
        fontSize: 16,
        marginLeft: 12,
      }}
    >
      {label}
    </Text>
    </View>
  );
}

export default SettingsScreen;
