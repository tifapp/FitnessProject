import LinkableText from "@components/LinkableText";
import PostImage from "@components/PostImage";
import printTime from "@hooks/printTime";
import { useNavigation } from "@react-navigation/native";
import falsey from "falsey";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Post } from "src/models";

interface Props {
  item: Post,
  writtenByYou: boolean,
  receiver: string
}

function MessageItem({
  item,
  writtenByYou,
  receiver
} : Props) {
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
          disabled={falsey(item.imageURL?.match("jpg"))}
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
            imageURL={item.imageURL}
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
          urlPreview={urlPreview}
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
}

export default React.memo(MessageItem);

const styles = StyleSheet.create({
  secondaryContainerStyle: {
    backgroundColor: "#fefefe",
  },
});
