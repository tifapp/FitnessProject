import { API, graphqlOperation, GraphQLQuery } from "@aws-amplify/api";
import IconButton from "@components/common/IconButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Conversation } from "src/models";
import {
  createBlock,
  deleteConversation,
  updateConversation
} from "../src/graphql/mutations";
import { getConversation } from "../src/graphql/queries";

interface Props {
  channel: string,
  receiver: string
}

export default function AcceptMessageButtons({
  channel,
  receiver
} : Props) {
  const [isConversationRequest, setIsConversationRequest] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const acceptMessageRequest = async () => {
    await API.graphql(
      graphqlOperation(updateConversation, {
        input: { id: channel, Accepted: 1 },
      })
    );
    setIsConversationRequest(false);
  };

  const rejectMessageRequest = async () => {
    await API.graphql(
      graphqlOperation(deleteConversation, {
        input: { id: channel },
      })
    );
    navigation.navigate("Conversations");
  };

  const checkIfConversationRequest = async () => {    
    const conversation = await API.graphql<GraphQLQuery<{getConversation: Conversation}>> (
      graphqlOperation(getConversation, { id: channel })
    );

    setIsConversationRequest(!!(conversation.data?.getConversation?.Accepted));
  };

  const blockMessageRequest = async () => {
    await API.graphql(
      graphqlOperation(deleteConversation, {
        input: { id: channel },
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

    globalThis.localBlockList.push({
      createdAt: new Date(Date.now()).toISOString(),
      userId: globalThis.myId,
      blockee: receiver,
    });

    navigation.navigate("Conversations");
  };

  useEffect(() => {
    const onFocus = navigation.addListener("focus", () => {
      checkIfConversationRequest();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return onFocus;
  }, [navigation]);

  return (
    isConversationRequest ? (
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
          textStyle={{fontSize: 18}}
          margin={0} isLabelFirst={false}        />

        <IconButton
          iconName={"clear"}
          size={22}
          color={"red"}
          onPress={rejectMessageRequest}
          style={{ paddingHorizontal: 12 }}
          label={"Reject"}
          textStyle={{fontSize: 18}}
          margin={0} isLabelFirst={false}       />

        <IconButton
          iconName={"block"}
          size={22}
          color={"black"}
          onPress={blockMessageRequest}
          style={{ paddingHorizontal: 12 }}
          label={"Block"}
          textStyle={{fontSize: 18}}
          margin={0} isLabelFirst={false}        />
      </View>
    ) : null
  )
}
