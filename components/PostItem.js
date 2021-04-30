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
  LayoutAnimation,
} from "react-native";
import { getUser } from "../src/graphql/queries";
import { ProfileImageAndName } from "./ProfileImageAndName";
import { API, graphqlOperation } from "aws-amplify";
import { createLike, deleteLike } from "root/src/graphql/mutations";
import { useNavigation } from "@react-navigation/native";
import printTime from "hooks/printTime";
import { MaterialIcons } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";
import playSound from "../hooks/playSound";

var styles = require("../styles/stylesheet");

var myTimeout;
var timerIsRunning = false;

function LikeButton({ likes, likedByYou, postId, callback }) {
  const [liked, setLiked] = useState(likedByYou);
  const likeRef = useRef();

  const resetTimeout = () => {
    //if there's already a timeout running do not update ref
    //if there isn't, update ref
    if (!timerIsRunning) {
      likeRef.current = liked;
    }
    timerIsRunning = true;
    clearTimeout(myTimeout);
    myTimeout = setTimeout(sendAPICall, 1000);
  }

  const sendAPICall = () => {
    if (liked == likeRef.current) {
      console.log("sent API call, hopefully debounce works.");
      if (!liked) {
        API.graphql(
          graphqlOperation(createLike, { input: { postId: postId } })
        );
      } else {
        API.graphql(
          graphqlOperation(deleteLike, {
            input: { userId: "0", postId: postId },
          })
        );
      }
    } else {
      console.log("you repeated yourself");
    }

    timerIsRunning = false;
  }

  const likePostAsync = async () => {
    callback();
    liked ? playSound("unlike") : playSound("like"); 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      setLiked(!liked);
      resetTimeout();
    } catch (err) {
      console.log(err);
      alert("Could not be submitted!");
    }
  };

  return (
    <TouchableOpacity
      style={[{ flex: 1, flexDirection: "row",
      paddingHorizontal: 15, paddingTop: 15, }]}
      onPress={likePostAsync}
    >
      <Text
        style={[
          { marginRight: 6, fontWeight: "bold", color: liked ? "red" : "gray" },
        ]}
      >
        {liked
          ? likes
            ? likedByYou
              ? likes
              : likes + 1
            : 1
          : likes
          ? likedByYou
            ? likes - 1
            : likes
          : 0}
      </Text>
      <MaterialIcons
        name={liked ? "favorite" : "favorite-outline"}
        size={17}
        color={liked ? "red" : "gray"}
        style={{ marginRight: 0 }}
      />
    </TouchableOpacity>
  );
}

export default function PostItem({
  item,
  deletePostsAsync,
  writtenByYou,
  editButtonHandler,
  replyButtonHandler,
  receiver,
  showTimestamp,
  newSection,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [replyingText, setReplyingText] = useState("");
  const displayTime = printTime(item.createdAt);
  const isReceivedMessage = receiver != null && !writtenByYou;
  //console.log(parentID);

  //
  if (receiver == null)
    return (
      <View style={styles.secondaryContainerStyle}>
        <View
          style={
            item.isParent == 1 ? styles.spaceAround : styles.spaceAroundReply
          }
        >
          <View>
            <ProfileImageAndName
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "white",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.18,
                shadowRadius: 1.0,

                elevation: 1,
              }}
              imageStyle={[styles.smallImageStyle, { marginRight: 15 }]}
              textLayoutStyle={{ flex: 1, marginTop: 15, marginBottom: 15 }}
              textStyle={{
                flex: 1,
                fontWeight: writtenByYou ? "bold" : "normal"
              }}
              userId={item.userId}
              subtitleComponent={
                <View style={{}}>
                  <Text style={{ color: "gray" }}>{displayTime}</Text>
                </View>
              }
              sibling={
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flex: 1,
                  }}
                >
                  <LikeButton
                    likes={item.likes}
                    likedByYou={item.likedByYou}
                    postId={
                      item.createdAt +
                      "#" +
                      item.userId +
                      "#" +
                      item.channel +
                      "#" +
                      item.parentId +
                      "#" +
                      item.isParent
                    }
                    callback={() => {item.likeDebounce = true}}
                  />
                  <TouchableOpacity
                    style={[
                      {
                        paddingHorizontal: 15,
                        paddingBottom: 15,
                        flex: 1,
                        borderWidth: 0,
                        flexDirection: "row",
                        alignItems: "flex-end",
                      },
                    ]}
                    onPress={() => setIsReplying(!isReplying)}
                  >
                    <Text
                      style={[
                        {
                          paddingRight: 6,
                          fontWeight: "bold",
                          color: isReplying ? "blue" : "gray",
                        },
                      ]}
                    >
                      0
                    </Text>
                    <MaterialIcons
                      name="chat-bubble-outline"
                      size={17}
                      color={isReplying ? "blue" : "gray"}
                      style={{ marginRight: 0 }}
                    />
                  </TouchableOpacity>
                </View>
              }
            />
            {isReplying ? (
              <View
                style={[
                  {
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,

                    elevation: 3,
                    position: "absolute",
                    top: -18,
                    left: -18,
                    flexDirection: "column",
                    alignItems: "flex-start",
                  },
                ]}
              >
                <View
                  style={{
                    backgroundColor: "blue",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    name="chat-bubble"
                    size={17}
                    color={"white"}
                    style={{ padding: 6 }}
                  />
                  <Text
                    style={[
                      { marginRight: 6, fontWeight: "bold", color: "white" },
                    ]}
                  >
                    Replying to
                  </Text>
                </View>
              </View>
            ) : null}
            <View
              style={{
                marginHorizontal: 24,
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "stretch",
              }}
            >
              {writtenByYou ? (
                <View
                  style={{
                    marginHorizontal: 24,
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.unselectedButtonStyle,
                      { borderColor: "red" },
                    ]}
                    color="red"
                    onPress={() => deletePostsAsync(item.createdAt)}
                  >
                    <Text
                      style={[
                        styles.unselectedButtonTextStyle,
                        { color: "red" },
                      ]}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.unselectedButtonStyle,
                      { borderColor: "blue" },
                    ]}
                    color="blue"
                    onPress={() => setIsEditing(!isEditing)}
                  >
                    <Text
                      style={[
                        styles.unselectedButtonTextStyle,
                        { color: "blue" },
                      ]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
          {isEditing ? (
            <TextInput
              style={[styles.check, { borderColor: "orange" }]}
              onChangeText={setEditedText}
              autoFocus={true}
            >
              {item.description}
            </TextInput>
          ) : (
            <Text
              style={{
                flex: 1,
                paddingTop: 24,
                paddingBottom: 36,
                paddingLeft: 12,
                fontSize: 16,
              }}
            >
              {item.description}
            </Text>
          )}
        </View>

        {isEditing ? (
          editedText === "" ? (
            <TouchableOpacity
              style={styles.unselectedButtonStyle}
              onPress={() => {
                alert("Edit the post");
              }}
            >
              <Text style={[styles.buttonTextStyle, { color: "gray" }]}>
                {"Edit Post"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={() => {
                editButtonHandler(item.createdAt, editedText),
                  setEditedText(""),
                  setIsEditing(false);
              }}
            >
              <Text style={styles.buttonTextStyle}>{"Edit Post"}</Text>
            </TouchableOpacity>
          )
        ) : null}

        {isReplying ? (
          <View>
            <TextInput
              style={[
                styles.check,
                {
                  borderColor: "blue",
                  backgroundColor: "#efefef",
                  marginHorizontal: 24,
                  paddingVertical: 12,
                },
              ]}
              onChangeText={setReplyingText}
              autoFocus={true}
            />
            {replyingText === "" ? (
              <TouchableOpacity
                style={[styles.unselectedButtonStyle, { flexDirection: "row", margin: 15 }]}
                onPress={() => {
                  alert("Reply can't be empty");
                }}
              >
                <MaterialIcons
                  name="add-circle"
                  size={30}
                  color={"gray"}
                  style={{ marginRight: 0 }}
                />
                <Text style={[styles.buttonTextStyle, { color: "gray" }]}>
                  {"Add Reply"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.buttonStyle, {
                  backgroundColor: "orange",
                  padding: 10,
                  borderRadius: 5,
                  margin: 15,
                flexDirection: "row"}]}
                onPress={() => {
                  replyButtonHandler(item.parentId, replyingText),
                    setReplyingText(""),
                    setIsReplying(false);
                }}
              >
              <MaterialIcons
                name="add-circle"
                size={30}
                color={"white"}
                style={{ marginRight: 0 }}
              />
              <Text style={[styles.buttonTextStyle]}>
                {"Add Reply"}
              </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
        <View
          style={{
            height: 1,
            backgroundColor: "#efefef",
            marginHorizontal: 12,
          }}
        ></View>
      </View>
    );
  else {
    /*
    showTimestamp
          ? {
            paddingHorizontal: 25,
            marginTop: 10,
            marginBottom: 40,
          }
          : newSection
            ? {
              paddingHorizontal: 25,
              marginTop: 40,
              marginBottom: 10,
            }
            : {
              paddingHorizontal: 25,
              paddingTop: 10,
              paddingBottom: 10,
            }
    */
    return (
      <View
        style={[styles.secondaryContainerStyle, { backgroundColor: "#fff" }]}
      >
        <View style={[styles.spaceAround]}>
          <View
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
            <Text style={{ color: "#000" }}>{item.description}</Text>
          </View>
          <View>
            <Text
              style={{
                color: "#000",
                marginTop: 15,
                textAlign: isReceivedMessage ? "left" : "right",
              }}
            >
              {displayTime}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}
