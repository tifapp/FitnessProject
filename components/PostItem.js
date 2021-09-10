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
  ActivityIndicator,
  Alert,
  Modal,
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
import LikesList from "components/LikesList";
import FeedScreen from "screens/FeedScreen";
import { MaterialIcons } from "@expo/vector-icons";
import { onIncrementLikes, onDecrementLikes, onIncrementReplies, onDecrementReplies } from 'root/src/graphql/subscriptions';
import * as Haptics from "expo-haptics";
import playSound from "../hooks/playSound";
import APIList from 'components/APIList';

var styles = require("../styles/stylesheet");

function LikeButton({ onTap, likes, myId, likedByYou, postId, likeDebounceRef }) {
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
  const displayTime = printTime(item.createdAt);
  const isReceivedMessage = receiver != null && !writtenByYou;

  const [areLikesVisible, setAreLikesVisible] = useState(false);

  const [likedUsers, setLikedUsers] = useState([]);

  if (item.loading) return (
    <ActivityIndicator 
    size="large" 
    color="#0000ff"
    style={{
      flex: 1,
      justifyContent: "center",
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 20,
    }} />
  )
  else if (receiver == null)
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
            imageID={item.imageURL}
            isVisible={isVisible}
          />

          <View style={{flexDirection: "row", justifyContent: "space-between"}}>
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
                paddingTop: 4,
                paddingLeft: 22,
                paddingBottom: 16,
              }}
              urlPreview={item.urlPreview}
            >
              {item.description}
            </LinkableText>
            )}

            <View style={{flexDirection: "column", alignItems: "flex-start", marginRight: 15}}>
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
                    isVisible={true}
                  />
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
    );
  }
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
              if (event.value.data.onIncrementLikes.likes != likes) setLikes(event.value.data.onIncrementLikes.likes);
            }
            else setLikes(event.value.data.onIncrementLikes.likes);
          },
          error: error => console.warn(error)
        });
        decrementLikeSubscription = API.graphql(graphqlOperation(onDecrementLikes, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
          next: event => {
            if (likeDebounce.current) {
              likeDebounce.current = false;
              if (event.value.data.onDecrementLikes.likes != likes) setLikes(event.value.data.onDecrementLikes.likes);
            }
            else setLikes(event.value.data.onDecrementLikes.likes);
          },
          error: error => console.warn(error)
        });
        incrementReplySubscription = API.graphql(graphqlOperation(onIncrementReplies, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
          next: event => {
            setReplies(event.value.data.onIncrementReplies.replies);
          },          
          error: error => console.warn(error)
        });
        decrementReplySubscription = API.graphql(graphqlOperation(onDecrementReplies, { createdAt: item.createdAt, userId: item.userId })).subscribe({ //nvm we dont have a subscription event for incrementlike
          next: event => {
            setReplies(event.value.data.onDecrementReplies.replies);
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

  useEffect(() => {item.likes = likes}, [likes])
  useEffect(() => {item.replies = replies}, [replies])

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
            likedByYou={item.likedByYou}
            postId={item.createdAt + "#" + item.userId}
            likeDebounceRef={likeDebounce}
            onTap={(liked) => {
              if (liked) {
                setLikes(likes => likes - 1);
                item.likedByYou = false;
              } else {
                setLikes(likes => likes + 1);
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

import { Video, AVPlaybackStatus } from 'expo-av';

const re = /(?:\.([^.]+))?$/;

function PostImage({imageID, isVisible}) {
  const [imageURL, setImageURL] = useState(null);
  const video = useRef(null);
  
  let imageKey = `feed/${imageID}`;
  let imageConfig = {
    expires: 86400,
  };

  useEffect(() => {
    //console.log("image id is ", imageID);
    if (imageID) {
      Storage.get(imageKey, imageConfig) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
        .then((imageURL) => {
          setImageURL(imageURL);
        })
        .catch((err) => {
          console.log("could not find image!", err);
          setImageURL(null);
        }); //should just use a "profilepic" component
    }
  }, [])

  useEffect(() => {
    if (video.current) {
      if (isVisible === true) {
        video.current.playAsync();
      } else if (isVisible === false) {
        video.current.pauseAsync();
      }
    }
  }, [isVisible])

  if (imageID) {
    return (
      (re.exec(imageID)[1] === 'jpg') ?
        <Image
          //onError={addUserInfotoCache}
          style={{
            resizeMode: "cover",
            width: Dimensions.get('window').width - 20,
            height: Dimensions.get('window').width - 20,
            alignSelf: "center",
            marginBottom: 15,
          }}
          source={
            (imageURL == null || imageURL === "") ?
              require("../assets/icon.png")
              : { uri: imageURL }
          }
        /> : <Video
          //onError={addUserInfotoCache}
          ref={video}
          style={{
            resizeMode: "cover",
            width: Dimensions.get('window').width - 20,
            height: Dimensions.get('window').width - 20,
            alignSelf: "center",
            marginBottom: 15,
          }}
          source={{ uri: imageURL }}
          posterSource={require("../assets/icon.png")}
          useNativeControls
          isLooping
        />
    )
  } else return null;
}