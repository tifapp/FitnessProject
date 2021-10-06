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
import { getUser } from "../src/graphql/queries";
import { ProfileImageAndName } from "./ProfileImageAndName";
import IconButton from "./IconButton";
import { batchGetLikes, likesByPost } from "root/src/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import { createLike, deleteLike } from "root/src/graphql/mutations";
import { useNavigation, useRoute } from "@react-navigation/native";
import printTime from "hooks/printTime";
import SHA256 from "hooks/hash";
import PostImage from "components/PostImage";
import LinkableText from "components/LinkableText";
import LikesList from "components/LikesList";
import FeedScreen from "screens/FeedScreen";
import { MaterialIcons } from "@expo/vector-icons";
import { onIncrementLikes, onDecrementLikes, onIncrementReplies, onDecrementReplies } from 'root/src/graphql/subscriptions';
import * as Haptics from "expo-haptics";
import playSound from "../hooks/playSound";
import APIList from 'components/APIList';

var styles = require("../styles/stylesheet");

function LikeButton({ onTap, likes, myId, item, postId, likeDebounceRef }) {
  const [liked, setLiked] = useState(item.likedByYou);
  const likeRef = useRef();
  const timerIsRunning = useRef();
  const likeTimeout = useRef();

  useEffect(() => {
    setLiked(item.likedByYou)
  }, [item.likedByYou])

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
            input: { userId: myId, postId: postId },
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
      onTap(liked);
      setLiked(!liked);
      resetTimeout();
    } catch (err) {
      console.log(err);
      alert("Could not be submitted!");
    }
  };

  return (
    <IconButton
      iconName={liked ? "favorite" : "favorite-outline"}
      size={17}
      color={liked ? "red" : "gray"}
      label={likes + ""}
      isLabelFirst={true}
      onPress={likePostAsync}
    />
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
  reportPost,
  isVisible,
  shouldSubscribe,
  myId,
  likes,
  replies,
  index
}) {
  const navigation = useNavigation();
  const route = useRoute();

  const [areRepliesVisible, setAreRepliesVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  const [areLikesVisible, setAreLikesVisible] = useState(false);

  const [likedUsers, setLikedUsers] = useState([]);

    return (
      <View style={[styles.secondaryContainerStyle, {
        backgroundColor: "#a9efe0",
      }]}>
        <View
          style={
            [styles.spaceAround,
            replyButtonHandler ? {} : {
              marginBottom: 20,
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
            myId={myId}
            deletePostsAsync={deletePostsAsync}
            writtenByYou={writtenByYou}
            toggleEditing={() => setIsEditing(!isEditing)}
            repliesPressed={() => replyButtonHandler ? replyButtonHandler() : setAreRepliesVisible(!areRepliesVisible)}
            areRepliesVisible={areRepliesVisible}
            reportPost={reportPost}
            shouldSubscribe={shouldSubscribe}
          />

          <PostImage
            style={{
              resizeMode: "cover",
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').width,
              alignSelf: "center",
              marginBottom: 15,
            }}
            imageID={item.imageURL}
            isVisible={isVisible && !areRepliesVisible}
          />

          <View style={{flexDirection: "row", justifyContent: "space-between", minHeight: writtenByYou ? 70 : 35,}}>
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
              }}
              textStyle={
                {
                  paddingTop: 4,
                  paddingBottom: 16,
                  marginLeft: 22,
                  maxWidth: Dimensions.get('window').width - 90,
                }
              }
              urlPreview={item.urlPreview}
            >
              {item.description}
            </LinkableText>
            )}

            <View style={{flexDirection: "column", position: "absolute", right: 15}}>
              {!writtenByYou ? (
                <IconButton
                  iconName={"report"}
                  size={20}
                  color={"gray"}
                  onPress={() => reportPost(item.createdAt, item.userId)}
                />
              ) : null}

              {writtenByYou ? (
                <IconButton
                  style={{marginBottom: 10}}
                  iconName={"delete-forever"}
                  size={20}
                  color={"gray"}
                  onPress={() => deletePostsAsync(item.createdAt)}
                />
              ) : null}

              {writtenByYou ? (
                <IconButton
                  style={{marginBottom: 15}}
                  iconName={"edit"}
                  size={20}
                  color={"gray"}
                  onPress={() => setIsEditing(!isEditing)}
                />
              ) : null}
            </View>
          </View>

          {
            item.loading ??
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: likedUsers.length > 0 ? 8 : 0, marginBottom: likedUsers.length > 0 ? 16 : 0 }} onPress={() => setAreLikesVisible(true)}>
              <APIList
                style={{ margin: 0, padding: 0 }}
                horizontal={true}
                queryOperation={likesByPost}
                filter={{ postId: item.createdAt + "#" + item.userId, sortDirection: "DESC", }}
                initialAmount={1}
                additionalAmount={0}
                data={likedUsers}
                setDataFunction={setLikedUsers}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ProfileImageAndName
                      style={{
                        alignContent: "flex-start",
                        alignItems: "center",
                        alignSelf: "flex-end",
                        justifyContent: "flex-start",
                        flexDirection: "row",
                        marginLeft: 15,
                        marginRight: 5,
                      }}
                      imageSize={20}
                      userId={item.userId}
                      onPress={() => setAreLikesVisible(true)}
                    />
                    <Text>
                      {likes > 1 ? "and " + (likes - 1) + " others" : ""} liked this post
                    </Text>
                  </View>
                )}
                keyExtractor={(item) => item.userId}
              />
            </TouchableOpacity>
          }

          <Modal
            animationType="slide"
            transparent={true}
            statusBarTranslucent={true}
            visible={areLikesVisible}
            onRequestClose={() => {
              setAreLikesVisible(false);
            }}
          >
            <TouchableOpacity onPress={() => setAreLikesVisible(false)} style={{ width: "100%", height: "100%", position: "absolute", backgroundColor: "#00000033" }}>
            </TouchableOpacity>
            <View style={{ marginTop: "auto", flex: 0.8, backgroundColor: "#a9efe0" }}>
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
                    backgroundColor: "red",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    name="favorite"
                    size={17}
                    color={"white"}
                    style={{ padding: 6 }}
                  />
                  <Text
                    style={[{ marginRight: 6, fontWeight: "bold", color: "white" }]}
                  >
                    Liked by
                  </Text>
                </View>
              </View>
              <LikesList postId={item.createdAt + "#" + item.userId} />
            </View>
          </Modal>
        </View>

        {isEditing ? (
          editedText === "" ? (
            <TouchableOpacity
              style={styles.unselectedButtonStyle}
              onPress={() => {
                alert("Post is empty!");
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
          <View 
          style={{ marginTop: "auto", flex: 0.8, backgroundColor: "#a9efe0" }}>
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
                <PostItem
                  index={index}
                  item={item}
                  myId={myId}
                  //deletePostsAsync={deletePostsAsync}
                  writtenByYou={item.userId === route.params?.myId}
                  //editButtonHandler={updatePostAsync} deleting a post while on the reply screen?
                  replyButtonHandler={() => {
                    setAreRepliesVisible(false);
                  }}
                  isVisible={true}
                  shouldSubscribe={true}
                />
              }
              autoFocus={true}
              navigation={navigation}
              route={route}
              channel={SHA256(item.userId + item.createdAt)} //unique id
              originalParentId={item.createdAt + "#" + item.userId}
            />
          </View>
        </Modal>
      </View>
    );
})

function PostHeader({ item, myId, writtenByYou, repliesPressed, deletePostsAsync, toggleEditing, areRepliesVisible, reportPost, shouldSubscribe }) {
  const [likes, setLikes] = useState(item.likes);
  const [replies, setReplies] = useState(item.replies);
  const likeDebounce = useRef(false);
  let incrementLikeSubscription, decrementLikeSubscription, incrementReplySubscription, decrementReplySubscription;

  useEffect(() => {
    if (!item.loading) {
      if (shouldSubscribe === true) { //should be true by default
        incrementLikeSubscription = API.graphql(graphqlOperation(onIncrementLikes, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
          next: event => {
            if (likeDebounce.current) {
              likeDebounce.current = false;
            }
            else {
              setLikes(event.value.data.onIncrementLikes.likes);
              item.likes = event.value.data.onIncrementLikes.likes;
            }
          },
          error: error => console.warn(error)
        });
        decrementLikeSubscription = API.graphql(graphqlOperation(onDecrementLikes, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
          next: event => {
            if (likeDebounce.current) {
              likeDebounce.current = false;
            }
            else {
              setLikes(event.value.data.onDecrementLikes.likes);
              item.likes = event.value.data.onDecrementLikes.likes;
            }
          },
          error: error => console.warn(error)
        });
        incrementReplySubscription = API.graphql(graphqlOperation(onIncrementReplies, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
          next: event => {
            setReplies(event.value.data.onIncrementReplies.replies);
            item.replies = event.value.data.onIncrementReplies.replies;
          },          
          error: error => console.warn(error)
        });
        decrementReplySubscription = API.graphql(graphqlOperation(onDecrementReplies, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
          next: event => {
            setReplies(event.value.data.onDecrementReplies.replies);
            item.replies = event.value.data.onDecrementReplies.replies;
          },
          error: error => console.warn(error)
        });
      } else if (shouldSubscribe === false) {
        if (incrementLikeSubscription)
          incrementLikeSubscription.unsubscribe();
        if (decrementLikeSubscription)
          decrementLikeSubscription.unsubscribe();
        if (incrementReplySubscription)
          incrementReplySubscription.unsubscribe();
        if (decrementReplySubscription)
          decrementReplySubscription.unsubscribe();
      }
      

      return () => {
        //console.log("removing subscriptions and post info is: ", item.userId, "\n")
        if (incrementLikeSubscription)
          incrementLikeSubscription.unsubscribe();
        if (decrementLikeSubscription)
          decrementLikeSubscription.unsubscribe();
        if (incrementReplySubscription)
          incrementReplySubscription.unsubscribe();
        if (decrementReplySubscription)
          decrementReplySubscription.unsubscribe();
      }
    }
  }, [shouldSubscribe])

  useEffect(() => {setLikes(item.likes)}, [item.likes]) //to change the feed screen
  useEffect(() => {setReplies(item.replies)}, [item.replies])

  return (
    <View
      style={{
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <ProfileImageAndName
        info={item.info}
        textStyle={{
          fontWeight: writtenByYou ? "bold" : "normal",
        }}
        userId={item.userId}
        subtitleComponent={
          <Text style={{ color: "gray" }}>{printTime(item.createdAt)}</Text>
        }
      />
      
      {        
        !item.loading ?
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
            alignSelf: "stretch"
          }}
        >
          <LikeButton
            myId={myId}
            likes={likes}
            item={item}
            postId={item.createdAt + "#" + item.userId}
            likeDebounceRef={likeDebounce}
            onTap={(liked) => {
              if (liked) {
                setLikes(likes => likes - 1);
                item.likes -= 1;
                item.likedByYou = false;
              } else {
                setLikes(likes => likes + 1);
                item.likes += 1;
                item.likedByYou = true;
              }
            }}
          />
          <IconButton
            iconName={"chat-bubble-outline"}
            size={17}
            color={areRepliesVisible ? "blue" : "gray"}
            label={replies + ""}
            isLabelFirst={true}
            onPress={repliesPressed}
          />
        </View>
        : null
      }

    </View>
  );
}