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
import { API, graphqlOperation } from "aws-amplify";

var styles = require("styles/stylesheet");

const SettingsScreen = ({ navigation, route }) => {
  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      console.log("got to settings", global.localBlockList);
      setBlockList([...global.localBlockList]);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return onFocus;
  }, [navigation])

  return (
    <View>
      <Text style={{
        fontSize: 18,
        color: "black",
      }}>Privacy</Text>
      <View style={{flexDirection: "row"}}>
        <APISwitch
          apicall={            
            () => 
            API.graphql(
              graphqlOperation(updateUser, { input: { friendRequestPrivacy: isEnabled } })
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
          apicall={            
            () => 
            API.graphql(
              graphqlOperation(updateUser, { input: { messagesPrivacy: isEnabled } })
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
function APISwitch({ apicall }) {
  const [isEnabled, setIsEnabled] = useState(false); //should fetch from backend
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
