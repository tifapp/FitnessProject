import Hyperlink from "react-native-hyperlink";
import RNUrlPreview from "components/RNUrlPreview";
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
  Modal
} from "react-native";
import { getUser } from "../src/graphql/queries";
import { ProfileImageAndName } from "./ProfileImageAndName";
import { API, graphqlOperation } from "aws-amplify";
import { createLike, deleteLike } from "root/src/graphql/mutations";
import { useNavigation, useRoute } from "@react-navigation/native";
import printTime from "hooks/printTime";
import SHA256 from "hooks/hash";
import LikesList from "components/LikesList";
import FeedScreen from "screens/FeedScreen";
import { MaterialIcons } from "@expo/vector-icons";
import { onIncrementLikes, onDecrementLikes, onIncrementReplies, onDecrementReplies } from 'root/src/graphql/subscriptions';
import * as Haptics from "expo-haptics";
import playSound from "../hooks/playSound";

var styles = require("../styles/stylesheet");

function LikeButton({ setLikes, likes, likedByYou, postId, likeDebounceRef }) {
  const [liked, setLiked] = useState(likedByYou);
  const likeRef = useRef();
  const timerIsRunning = useRef();
  const likeTimeout = useRef();

  const resetTimeout = () => {
    //if there's already a timeout running do not update ref
    //if there isn't, update ref
    if (!timerIsRunning.current) {
      likeRef.current = liked;
    }
    timerIsRunning.current = true;
    clearTimeout(likeTimeout.current);
    likeTimeout.current = setTimeout(sendAPICall, 1000);
  };

  const sendAPICall = () => {
    likeDebounceRef.current = true;
    if (liked == likeRef.current) {
      //console.log("sent API call, hopefully debounce works.");
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
    }

    timerIsRunning.current = false;
  };

  const likePostAsync = async () => {
    liked ? playSound("unlike") : playSound("like");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      liked ? setLikes(likes - 1) : setLikes(likes + 1);
      setLiked(!liked);
      resetTimeout();
    } catch (err) {
      console.log(err);
      alert("Could not be submitted!");
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          flex: 1,
          flexDirection: "row",
          paddingHorizontal: 15,
          paddingTop: 15,
        },
      ]}
      onPress={likePostAsync}
    >
      <Text
        style={[
          { marginRight: 6, fontWeight: "bold", color: liked ? "red" : "gray" },
        ]}
      >
        {likes}
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

function LinkableText(props) {
  const warnExternalSite = (url, text) => {
    const title =
      "This link will take you to an external site (" +
      url +
      "). Do you want to continue?";
    const options = [
      {
        text: "Yes",
        onPress: () => {
          Linking.openURL(url);
        },
      },
      {
        text: "Cancel",
        type: "cancel",
      },
    ];
    Alert.alert(title, "", options);
  };

  //console.log("the url we're passing to preview is ", props.urlPreview)

  return (
    <View>
      <View style={props.style}>
        <Hyperlink linkStyle={{ color: "#2980b9" }} onPress={warnExternalSite}>
          <Text
            style={{
              fontSize: 16,
            }}
          >
            {props.children}
          </Text>
        </Hyperlink>
      </View>
      <RNUrlPreview
        urlPreview={props.urlPreview}
        descriptionNumberOfLines={2}
        onPress={warnExternalSite}
      />
    </View>
  );
}

export default React.memo(function PostItem({
  item,
  deletePostsAsync,
  writtenByYou,
  editButtonHandler,
  replyButtonHandler,
  receiver,
  showTimestamp,
  newSection,
  index
}) {
  const navigation = useNavigation();
  const route = useRoute();

  const [areRepliesVisible, setAreRepliesVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [replyingText, setReplyingText] = useState("");
  const displayTime = printTime(item.createdAt);
  const isReceivedMessage = receiver != null && !writtenByYou;

  //
  if (receiver == null)
    return (
      <View style={[styles.secondaryContainerStyle, {
        backgroundColor: "#efefef",
      }]}>
        <View
          style={
            [styles.spaceAround,
            replyButtonHandler ? {} : {
              marginBottom: 20,
              marginHorizontal: 10,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,

              elevation: 1,
            }]
          }
        >
          <PostHeader
            item={item}
            deletePostsAsync={deletePostsAsync}
            writtenByYou={writtenByYou}
            setIsEditing={setIsEditing}
            repliesPressed={() => replyButtonHandler ? replyButtonHandler() : setAreRepliesVisible(!areRepliesVisible)}
            areRepliesVisible={areRepliesVisible}
          />
          {isEditing ? (
            <TextInput
              style={[styles.check, { borderColor: "orange" }]}
              onChangeText={setEditedText}
              autoFocus={true}
            >
              {item.description}
            </TextInput>
          ) : (
            <LinkableText
              style={{
                flex: 1,
                paddingTop: 8,
                paddingBottom: 22,
                paddingLeft: 22,
              }}
              urlPreview={item.urlPreview}
            >
              {item.description}
            </LinkableText>
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

        <Modal
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          visible={areRepliesVisible}
          onRequestClose={() => {
            setAreRepliesVisible(false);
          }}
        >
          <TouchableOpacity onPress={() => setAreRepliesVisible(false)} style={{ width: "100%", height: "100%", position: "absolute", backgroundColor: "#00000033" }}>
          </TouchableOpacity>
          <View style={{ marginTop: "auto", flex: 0.8, backgroundColor: "#efefef" }}>
            <View style={{ height: 1, width: "100%", alignSelf: "center", backgroundColor: "lightgray" }}>
            </View>
            <View style={{ margin: 10, width: 25, height: 2, alignSelf: "center", backgroundColor: "lightgray" }}>
            </View>
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
                  style={[{ marginRight: 6, fontWeight: "bold", color: "white" }]}
                >
                  Replying to
                </Text>
              </View>
            </View>
            <FeedScreen
              headerComponent={
                <View>
                <PostItem
                  index={index}
                  item={item}
                  //deletePostsAsync={deletePostsAsync}
                  writtenByYou={item.userId === route.params?.myId}
                  //editButtonHandler={updatePostAsync}
                  replyButtonHandler={() => {
                    setAreRepliesVisible(false);
                  }}
                />
                <LikesList postId={item.createdAt + "#" + item.userId} />
                </View>
              }
              navigation={navigation}
              route={route}
              channel={SHA256(item.userId + item.createdAt)} //unique id
              originalParentId={item.createdAt + "#" + item.userId}
            />
          </View>
        </Modal>
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
          <View>
            <Text
              style={{
                color: "gray",
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
}, (oldProps, newProps) => oldProps.item == newProps.item)

function PostHeader({ item, writtenByYou, repliesPressed, deletePostsAsync, setIsEditing, areRepliesVisible }) {
  const [likes, setLikes] = useState(item.likes);
  const currentLikes = useRef();
  currentLikes.current = likes;
  const [replies, setReplies] = useState(item.replies);
  const currentReplies = useRef();
  currentReplies.current = replies;
  const likeDebounce = useRef(false);

  useEffect(() => {
    if (!item.loading) {
      const incrementLikeSubscription = API.graphql(graphqlOperation(onIncrementLikes, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
        next: event => {
          console.log("liked post!")
          if (likeDebounce.current) {
            console.log("you liked post!")
            likeDebounce.current = false;
          }
          else setLikes(currentLikes.current + 1);
        }
      });
      const decrementLikeSubscription = API.graphql(graphqlOperation(onDecrementLikes, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
        next: event => {
          console.log("unliked post!")
          if (likeDebounce.current) {
            likeDebounce.current = false;
          }
          else setLikes(currentLikes.current - 1);
        }
      });
      const incrementReplySubscription = API.graphql(graphqlOperation(onIncrementReplies, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
        next: event => {
          setReplies(currentReplies.current + 1);
        }
      });
      const decrementReplySubscription = API.graphql(graphqlOperation(onDecrementReplies, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
        next: event => {
          setReplies(currentReplies.current - 1);
        }
      });

      return () => {
        incrementLikeSubscription.unsubscribe();
        decrementLikeSubscription.unsubscribe();
        incrementReplySubscription.unsubscribe();
        decrementReplySubscription.unsubscribe();
      }
    }
  }, [])

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <ProfileImageAndName
        info={item.info}
        imageStyle={[styles.smallImageStyle, { marginRight: 5 }]}
        textLayoutStyle={{ flex: 1, marginTop: 15, marginBottom: 15 }}
        textStyle={{
          flex: 1,
          fontWeight: writtenByYou ? "bold" : "normal",
        }}
        userId={item.userId}
        subtitleComponent={
          <View style={{}}>
            <Text style={{ color: "gray" }}>{printTime(item.createdAt)}</Text>
          </View>
        }
        sibling={
          !item.loading ?
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flex: 1,
            }}
          >
            <LikeButton
              setLikes={setLikes}
              likes={likes}
              likedByYou={item.likedByYou}
              postId={item.createdAt + "#" + item.userId}
              likeDebounceRef={likeDebounce}
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
              onPress={repliesPressed}
            >
              <Text
                style={[
                  {
                    paddingRight: 6,
                    fontWeight: "bold",
                    color: areRepliesVisible ? "blue" : "gray",
                  },
                ]}
              >
                {replies}
              </Text>
              <MaterialIcons
                name="chat-bubble-outline"
                size={17}
                color={areRepliesVisible ? "blue" : "gray"}
                style={{ marginRight: 0 }}
              />
            </TouchableOpacity>
          </View>
          : null
        }
      />
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
      </View>
    </View>
  );
}