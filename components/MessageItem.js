import React, { useState, useEffect, useRef, PureComponent } from "react";
import {
    StyleSheet,
    View,
    Button,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
    Linking,
    LayoutAnimation,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Dimensions
} from "react-native";
import LinkableText from "components/LinkableText";
import printTime from "hooks/printTime";
import PostImage from "components/PostImage";
import { useNavigation, useRoute } from "@react-navigation/native";

var styles = require('styles/stylesheet');

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
    index
}) {
    const isReceivedMessage = receiver != null && !writtenByYou;
    const navigation = useNavigation();

    return (
        <View
            style={[styles.secondaryContainerStyle, { backgroundColor: "#fff", marginTop: 21, marginHorizontal: 15, }]}
        >
            <View
                style={{
                    maxWidth: Dimensions.get('window').width - 80,
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
                }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Image", { uri: item.imageURL })}
                >
                    <PostImage
                        style={{
                            resizeMode: "cover",
                            width: Dimensions.get('window').width / 2,
                            height: Dimensions.get('window').width / 2,
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
})