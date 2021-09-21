import React, { useState, useEffect, useRef, PureComponent } from "react";
import { Storage } from "aws-amplify";
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

    return (
        <View
            style={[styles.secondaryContainerStyle, { backgroundColor: "#fff" }]}
        >
            <View style={[styles.spaceAround]}>
                <LinkableText
                    style={{
                        alignSelf: isReceivedMessage ? "flex-start" : "flex-end",
                        backgroundColor: "#efefef",
                        padding: 15,

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
                    {item.description}
                </LinkableText>
                <Text
                    style={{
                        color: "gray",
                        marginTop: 15,
                        textAlign: isReceivedMessage ? "left" : "right",
                    }}
                >
                    {printTime(item.createdAt)}
                </Text>
            </View>
        </View>
    );
})