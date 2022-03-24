// @ts-nocheck
import IconButton from "@components/common/IconButton";
import { API, graphqlOperation } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  createBlock,
  deleteConversation,
  updateConversation
} from "../src/graphql/mutations";
import { getConversation } from "../src/graphql/queries";

export default function AcceptMessageButtons({
  navigation,
  route,
  id,
  channel,
  receiver,
}) {
  const [ButtonCheck, setButtonCheck] = useState(false);

  const acceptMessageRequest = async () => {
    await API.graphql(
      graphqlOperation(updateConversation, {
        input: { id: channel, Accepted: 1 },
      })
    );
    setButtonCheck(true);
  };

  const rejectMessageRequest = async () => {
    await API.graphql(
      graphqlOperation(deleteConversation, {
        input: { id: id },
      })
    );
    navigation.navigate("Conversations");
  };

  const checkButton = async () => {
    let namesArray = [route.params?.myId, receiver];
    namesArray.sort();

    let temp = namesArray[0] + namesArray[1];

    let newConversations1 = await API.graphql(
      graphqlOperation(getConversation, { id: temp })
    );

    newConversations1 = newConversations1.data.getConversation;

    if (newConversations1 == null) {
      setButtonCheck(false);
    } else if (newConversations1.Accepted) {
      setButtonCheck(true);
    } else {
      setButtonCheck(false);
    }

    //let checkConversationExists = newConversations1.find(item => (item.users[0] === route.params?.myId && item.users[1] === receiver) || (item.users[0] === receiver && item.users[1] === route.params?.myId));
    //let checkMessageRequestExists = newConversations2.find(item => (item.users[0] === route.params?.myId && item.users[1] === receiver) || (item.users[0] === receiver && item.users[1] === route.params?.myId));
  };

  const blockMessageRequest = async () => {
    await API.graphql(
      graphqlOperation(deleteConversation, {
        input: { id: id },
      })
    );

    try {
      await API.graphql(
        graphqlOperation(createBlock, { input: { blockee: receiver } })
      );
      console.log("Inside the create block");
    } catch (err) {
      console.log("error in blocking user: ", err);
    }

    global.localBlockList.push({
      createdAt: new Date(Date.now()).toISOString(),
      userId: route.params?.myId,
      blockee: id,
    });

    navigation.navigate("Conversations");
  };

  useEffect(() => {
    const onFocus = navigation.addListener("focus", () => {
      console.log("Inside the Use Effect for check button");
      checkButton();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return onFocus;
  }, [navigation]);

  return (
    ButtonCheck && (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 15,
        }}
      >
        <IconButton
          iconName={"check"}
          size={22}
          color={"green"}
          onPress={acceptMessageRequest}
          style={{ paddingHorizontal: 12 }}
          label={"Accept"}
          fontSize={18}
        />

        <IconButton
          iconName={"clear"}
          size={22}
          color={"red"}
          onPress={rejectMessageRequest}
          style={{ paddingHorizontal: 12 }}
          label={"Reject"}
          fontSize={18}
        />

        <IconButton
          iconName={"block"}
          size={22}
          color={"black"}
          onPress={blockMessageRequest}
          style={{ paddingHorizontal: 12 }}
          label={"Block"}
          fontSize={18}
        />
      </View>
    )
  );
}
