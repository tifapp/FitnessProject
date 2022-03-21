import { Picker } from "@react-native-picker/picker";
import { API, graphqlOperation } from "aws-amplify";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { updateUser } from "root/src/graphql/mutations";
import { getUser } from "root/src/graphql/queries";

var styles = require("styles/stylesheet");

const PrivacyScreen = ({ navigation, route }) => {
  const [previousSettings, setPreviousSettings] = useState();

  useEffect(() => {
    (async () => {
      //console.log("your id is ", route.params?.myId)
      const user = await API.graphql(
        graphqlOperation(getUser, { id: route.params?.myId })
      );
      console.log(user.data.getUser);
      setPreviousSettings(user.data.getUser);
    })();
  }, []);

  if (!previousSettings) return null;
  else
    return (
      <View
        style={{
          margin: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: "black",
            marginBottom: 18,
          }}
        >
          Privacy
        </Text>
        <APISwitch
          initialState={previousSettings.messagesPrivacy}
          apicall={(enabled) =>
            API.graphql(
              graphqlOperation(updateUser, {
                input: { friendRequestPrivacy: enabled },
              })
            )
          }
          label="Who can send you friend requests?"
          options={[
            { label: "Anybody", value: 0 },
            { label: "Mutual friends", value: 1 },
            { label: "Nobody", value: 3 },
          ]}
        />
        <APISwitch
          initialState={previousSettings.friendRequestPrivacy}
          apicall={(enabled) =>
            API.graphql(
              graphqlOperation(updateUser, {
                input: { messagesPrivacy: enabled },
              })
            )
          }
          label="Who can message you?"
          options={[
            { label: "Anybody", value: 0 },
            { label: "Friends and mutuals", value: 1 },
            { label: "Friends only", value: 2 },
          ]}
        />
      </View>
    );
};

function APISwitch({ initialState, apicall, label, options }) {
  const [selectedSetting, setSelectedSetting] = useState(initialState ?? 0); //should fetch from backend

  const toggleAsync = (itemValue, itemIndex) => {
    //liked ? playSound("unlike") : playSound("like");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      setSelectedSetting(itemValue);
      apicall(itemValue);
      console.log(itemValue);
    } catch (err) {
      console.log(err);
      alert("Could not be submitted!");
    }
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <Text
        style={{
          fontSize: 16,
          alignSelf: "center",
          top: 20,
        }}
      >
        {label}
      </Text>
      <Picker
        numberOfLines={2}
        selectedValue={selectedSetting}
        onValueChange={toggleAsync}
        itemStyle={{ fontSize: 16, color: "blue", height: 100 }}
      >
        {options.map((option) => (
          <Picker.Item label={option.label} value={option.value} />
        ))}
      </Picker>
    </View>
  );
}

export default PrivacyScreen;
