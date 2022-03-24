// @ts-nocheck
import LinkableText from "@components/LinkableText";
import PostImage from "@components/PostImage";
import printTime from "@hooks/printTime";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

var styles = require("styles/stylesheet");

export default React.memo(function MessageItem({
  item,
  deletePostsAsync,
  writtenByYou,
  editButtonHandler,
  replyButtonHandler,
  receiver,
  showTimestamp,
  newSection,
  reportPost,
  isVisible,
  shouldSubscribe,
  myId,
  likes,
  replies,
  index,
}) {
  const isReceivedMessage = receiver != null && !writtenByYou;
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.secondaryContainerStyle,
        { backgroundColor: "#fff", marginTop: 21, marginHorizontal: 15 },
      ]}
    >
      <View
        style={{
          maxWidth: Dimensions.get("window").width - 80,
          alignSelf: isReceivedMessage ? "flex-start" : "flex-end",
          backgroundColor: isReceivedMessage ? "#efefef" : "#a9efe0",
          padding: 15,
          paddingBottom: 0,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,

          elevation: 6,
        }}
      >
        <TouchableOpacity
          disabled={item.imageURL && !item.imageURL.match("jpg")}
          onPress={() => navigation.navigate("Image", { uri: item.imageURL })}
        >
          <PostImage
            style={{
              resizeMode: "cover",
              width: Dimensions.get("window").width / 2,
              height: Dimensions.get("window").width / 2,
              alignSelf: "center",
              marginBottom: 15,
            }}
            imageID={item.imageURL}
            isVisible={false}
          />
        </TouchableOpacity>
        <LinkableText
          style={{
            alignSelf: isReceivedMessage ? "flex-start" : "flex-end",
          }}
          textStyle={{
            paddingBottom: 15,
          }}
          urlPreview={item.urlPreview}
        >
          {item.description}
        </LinkableText>
      </View>
      <Text
        style={{
          color: isReceivedMessage ? "gray" : "#136351",
          textAlign: isReceivedMessage ? "left" : "right",
          marginTop: 5,
        }}
      >
        {printTime(item.createdAt)}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  secondaryContainerStyle: {
    backgroundColor: "#fefefe",
  }
});