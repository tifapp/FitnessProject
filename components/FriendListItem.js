import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
} from "react-native";
import { ProfileImageAndName } from "./ProfileImageAndName";
import { MaterialIcons } from "@expo/vector-icons";
import computeDistance from "hooks/computeDistance";
import getLocation from "hooks/useLocation";

import { API, graphqlOperation } from "aws-amplify";
import { postsByChannelLatest } from "root/src/graphql/queries";

var styles = require("../styles/stylesheet");

export default function FriendListItem({
  item,
  navigation,
  removeFriendHandler,
  friendId,
}) {
  const goToMessages = (id) => {
    navigation.navigate("Messages", { userId: id });
  };

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  const alertOptions = {
    cancelable: true,
    onDismiss: () => setIsOptionsOpen(false),
  };

  useEffect(() => {
    (async () => {
      const query = await API.graphql(
        graphqlOperation(postsByChannelLatest, { limit: 1, channel: myId > friendId ? ,})
      );

      nextToken = query.data[Object.keys(query.data)[0]].nextToken
      results = [...query.data[Object.keys(query.data)[0]].items, ...results]
      console.log(results);
      setLastMessage(); //truncate the beginning of the message if it's too long
    })();
  },[])

  return (
    <View>
      <View
        style={[
          { flexDirection: "row", alignItems: "flex-start" },
          isOptionsOpen && { backgroundColor: "orange" },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            const title = "More Options";
            const message = "";
            const options = [
              {
                text: "Block",
                onPress: () => {},
              }, //if submithandler fails user won't know
              {
                text: "Unfriend",
                onPress: () => {
                  const title = "Are you sure you want to remove this friend?";
                  const options = [
                    {
                      text: "Yes",
                      onPress: () => {
                        removeFriendHandler(item), setIsOptionsOpen(false);
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
                },
              }, //if submithandler fails user won't know
              {
                text: "Cancel",
                type: "cancel",
                onPress: () => {
                  setIsOptionsOpen(false);
                },
              },
            ];
            Alert.alert(title, message, options, alertOptions);
            setIsOptionsOpen(true);
          }}
          style={{ alignSelf: "center", paddingHorizontal: 8 }}
        >
          <MaterialIcons
            name="more-vert"
            size={20}
            color={isOptionsOpen ? "black" : "gray"}
          />
        </TouchableOpacity>
        <ProfileImageAndName
          navigationObject={navigation}
          style={{ flex: 1 }}
          imageStyle={{
            resizeMode: "cover",
            width: 50,
            height: 50,
            alignSelf: "center",
          }}
          imageLayoutStyle={{ marginLeft: 0 }}
          textStyle={{
            fontWeight: "normal",
            fontSize: 15,
            color: "black",
          }}
          userId={friendId}
          textLayoutStyle={{ flex: 1, flexGrow: 1 }}
          subtitleComponent={
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={styles.subtitleButton}
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setIsMessageOpen(!isMessageOpen);
                }}
              >
                <MaterialIcons
                  name="chat"
                  size={20}
                  color={isOptionsOpen ? "black" : "blue"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    color: isOptionsOpen ? "black" : "blue",
                    fontSize: 15,
                    fontWeight: "bold",
                  }}
                >
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
      <View style={{ flex: open ? 0 : 1 }}>
        {isMessageOpen ? (
          <View>
            <TouchableOpacity
              style={styles.subtitleButton}
              onPress={() => goToMessages(friendId)}
            >
              <Text
                style={{
                  color: isOptionsOpen ? "black" : "blue",
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                View More
              </Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <TextInput
                style={[
                  styles.textInputStyle,
                  { marginTop: 5, marginBottom: 30 },
                ]}
                multiline={true}
                placeholder="Start Typing..."
                onChangeText={setPostVal}
                value={postVal}
                clearButtonMode="always"
                maxLength={1000}
              />
              <MaterialIcons
                name="add-circle"
                size={30}
                color={"gray"}
                style={{ marginRight: 0 }}
              />
            </View>
          </View>
        ) : null}
      </View>
      <View
        style={{ height: 1, backgroundColor: "#efefef", marginHorizontal: 12 }}
      ></View>
    </View>
  );
}
