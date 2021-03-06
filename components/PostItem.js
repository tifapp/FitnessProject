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
} from "react-native";
import { getUser } from "../src/graphql/queries";
import { ProfileImageAndName } from './ProfileImageAndName'
import { API, graphqlOperation } from "aws-amplify";
import { createLike, deleteLike } from "root/src/graphql/mutations";
import { useNavigation } from '@react-navigation/native';
import printTime from 'hooks/printTime';
import { MaterialIcons } from "@expo/vector-icons";

import * as Haptics from 'expo-haptics';

var styles = require('../styles/stylesheet');

function LikeButton({
  likes,
  likedByYou,
  postId
}) {
  const [liked, setLiked] = useState(likedByYou);
  
  const likePostAsync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      setLiked(!liked);
      if (liked) {
        await API.graphql(graphqlOperation(deleteLike, { input: { userId: "0", postId: postId, } }));
        console.log("success in unliking post");
      } else {
        await API.graphql(graphqlOperation(createLike, { input: { postId: postId, } }));
        console.log("success in liking post, id is ", postId);
      }
    } catch (err) {
      console.log(err);
      alert('Could not be submitted!');
    }
  }

  if (liked) {
    return (
      <TouchableOpacity style={[{ alignItems: "flex-end", flexDirection: "row" }]} onPress={likePostAsync}>
        <MaterialIcons
                name="favorite"
                size={18}
                color={"red"}
                style={{ marginRight: 0 }}
              />
        <Text style={[styles.unselectedButtonTextStyle, { color: 'red' }]}>{likes ? likedByYou ? likes : likes + 1 : 1}</Text>
      </TouchableOpacity>
    )
  } else {
    return (
      <TouchableOpacity style={[{ flexDirection: "row", borderColor: 'red', borderWidth: 0 }]} color="red" onPress={likePostAsync}>
      <MaterialIcons
              name="favorite-outline"
              size={18}
              color={"red"}
              style={{ marginRight: 0 }}
            />
        <Text style={[styles.unselectedButtonTextStyle, { color: 'red' }]}>{likes ? likedByYou ? likes - 1 : likes : 0}</Text>
      </TouchableOpacity>
    )
  }
}

export default function PostItem({
  item,
  deletePostsAsync,
  writtenByYou,
  editButtonHandler,
  replyButtonHandler,
  receiver,
  showTimestamp,
  newSection
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
          <View
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
          >
            <ProfileImageAndName
              imageStyle={[styles.smallImageStyle, { marginRight: 15 }]}
              textLayoutStyle={{ flex: 1 }}
              textStyle={{
                fontSize: 15,
                flex: 1,
              }}
              userId={item.userId}
              subtitleComponent={
                <View style={{}}>
                  <Text>{displayTime}</Text>
                </View>
              }
            />
            <View
              style={{
                marginHorizontal: 30,
                flexDirection: "column",
                justifyContent: "space-evenly",
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
              />
              {writtenByYou ? (
                <View
                  style={{
                    marginHorizontal: 30,
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                  }}
                >
                  <TouchableOpacity
                    style={[styles.unselectedButtonStyle, { borderColor: "red" }]}
                    color="red"
                    onPress={() => deletePostsAsync(item.createdAt)}
                  >
                    <Text
                      style={[styles.unselectedButtonTextStyle, { color: "red" }]}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
    
                  <TouchableOpacity
                    style={[styles.unselectedButtonStyle, { borderColor: "blue" }]}
                    color="blue"
                    onPress={() => setIsEditing(!isEditing)}
                  >
                    <Text
                      style={[styles.unselectedButtonTextStyle, { color: "blue" }]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {item.isParent == 1 ? (
                <TouchableOpacity
                  style={[styles.unselectedButtonStyle, { borderWidth: 0 }]}
                  color="orange"
                  onPress={() => setIsReplying(!isReplying)}
                >
                  <Text
                    style={[styles.unselectedButtonTextStyle, { color: "blue" }]}
                  >
                    Reply
                  </Text>
                </TouchableOpacity>
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
            <Text style={{flex: 1}}>{item.description}</Text>
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
              style={[styles.check, { borderColor: "orange" }]}
              onChangeText={setReplyingText}
              autoFocus={true}
            />
            {replyingText === "" ? (
              <TouchableOpacity
                style={styles.unselectedButtonStyle}
                onPress={() => {
                  alert("Reply can't be empty");
                }}
              >
                <Text style={[styles.buttonTextStyle, { color: "gray" }]}>
                  {"Submit Reply"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.buttonStyle}
                onPress={() => {
                  replyButtonHandler(item.parentId, replyingText),
                    setReplyingText(""),
                    setIsReplying(false);
                }}
              >
                <Text style={styles.buttonTextStyle}>{"Submit Reply"}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
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
      <View style={[styles.secondaryContainerStyle, { backgroundColor: '#fff' }]}>
        <View style={[styles.spaceAround]}>
          <View
            style={
              {
                alignSelf: isReceivedMessage ? 'flex-start' : 'flex-end',
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
              }
            }
          >
            <Text style={{ color: '#000' }}>{item.description}</Text>
          </View>
          <View>
            <Text style={{ color: '#000', marginTop: 15, textAlign: isReceivedMessage ? 'left' : 'right' }}>{displayTime}</Text>
          </View>
        </View>
      </View>
    );
  }
}