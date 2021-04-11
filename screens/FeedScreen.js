import React, { useState, useEffect, useRef, PureComponent } from "react";
import {
  StyleSheet,
  Text,
  Button,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  LayoutAnimation,
} from "react-native";
// Get the aws resources configuration parameters
import { API, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost, createConversation, updateConversation } from "root/src/graphql/mutations";
import { listPosts, postsByChannel, batchGetLikes } from "root/src/graphql/queries";
import PostItem from "components/PostItem";
import { onCreatePost, onDeletePost, onUpdatePost, onCreateLike, onDeleteLike, didIncrementLikes } from 'root/src/graphql/subscriptions';
import NetInfo from '@react-native-community/netinfo';
import APIList from 'components/APIList';
import { MaterialIcons } from '@expo/vector-icons';
import { lessThan } from "react-native-reanimated";
import { ProfileImageAndName } from "components/ProfileImageAndName";

require('root/androidtimerfix');

var styles = require('styles/stylesheet');

export default function FeedScreen({ navigation, route, receiver, channel, headerComponent }) {
  const [postVal, setPostVal] = useState("");
  const [posts, setPosts] = useState([]);
  const numCharsLeft = 1000 - postVal.length;

  const [onlineCheck, setOnlineCheck] = useState(true);

  const currentPosts = useRef();
  const scrollRef = useRef(); // Used to help with automatic scrolling to top
  
  currentPosts.current = posts;

  const getChannel = () => {
    return channel == null ? 'general' : channel
  }

  useEffect(() => {
    const createPostSubscription = API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: event => {
        const newPost = event.value.data.onCreatePost
        if (newPost.userId != route.params?.myId && newPost.channel == getChannel() && (currentPosts.current.length == 0 || !currentPosts.current.find(post => post.userId === newPost.userId && post.createdAt === newPost.createdAt))) { //uhoh security issue, we shouldnt be able to see other group's posts //acts as validation, maybe disable textinput while this happens
          if (newPost.isParent == 0) {
              if (currentPosts.current.length > 0 && currentPosts.current.find(post => post.parentId === newPost.parentId)) {
                let tempposts = currentPosts.current;
                var index = tempposts.indexOf(tempposts[tempposts.findIndex(p => p.parentId === newPost.parentId)]);
                tempposts.splice(index + 1, 0, newPost);                
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setPosts(tempposts);
              }
          }
          else {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setPosts([newPost, ...currentPosts.current]); //what if we have a lot of new posts at once?
          }
        }
      }
    });
    const deletePostSubscription = API.graphql(graphqlOperation(onDeletePost)).subscribe({
      next: event => {
        const deletedPost = event.value.data.onDeletePost
        if (deletedPost.userId != route.params?.myId && deletedPost.channel == getChannel()) { //uhoh security issue, we shouldnt be able to see other group's posts //acts as validation, maybe disable textinput while this happens
          if (currentPosts.current.length > 0 && currentPosts.current.find(post => post.userId === deletedPost.userId && post.createdAt === deletedPost.createdAt)) {
            let tempposts = currentPosts.current;
            var index = tempposts.findIndex(post => post.userId === deletedPost.userId && post.createdAt === deletedPost.createdAt);
            tempposts.splice(index, 1);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setPosts(tempposts);
          }
        }
      }
    });
    const updatePostSubscription = API.graphql(graphqlOperation(onUpdatePost)).subscribe({ //nvm we dont have a subscription event for incrementlike
      next: event => {
        console.log("post has been updated");
      }
    });
    // const incrementLikeSubscription = API.graphql(graphqlOperation(didIncrementLikes)).subscribe({ //nvm we dont have a subscription event for incrementlike
    //   next: event => {
    //     console.log("post has been liked");
    //   }
    // });
    checkInternetConnection();
    return () => {
      createPostSubscription.unsubscribe();
      deletePostSubscription.unsubscribe();
      updatePostSubscription.unsubscribe();
      //incrementLikeSubscription.unsubscribe();
    }
  }, []);

  const getLikedPosts = async (items) => {
    let newPosts = items;
    let postIds = [];

    newPosts.forEach(item => {
      postIds.push({postId: item.createdAt + "#" + item.userId + "#" + item.channel + "#" + item.parentId + "#" + item.isParent});
    });

    try {
      const likes = await API.graphql(graphqlOperation(batchGetLikes, { likes: postIds }));
      console.log("looking for likes: ", likes);
      //returns an array of like objects or nulls corresponding with the array of newposts
      for (i = 0; i < newPosts.length; ++i) {
        if (likes.data.batchGetLikes[i] != null) {
          console.log("found liked post");
          newPosts[i].likedByYou = true;
        } else {
          newPosts[i].likedByYou = false;
        }
      }
      return newPosts;
    } catch (err) {
      console.log("error in detecting likes: ", err);
    }
  }

  const showTimestamp = (item, index) => {
    return index >= posts.length-1 || ((((new Date(item.createdAt).getTime() - new Date(posts[index+1].createdAt).getTime()) / 1000) / 60) / 60 > 1);
  }

  const checkInternetConnection = () => {
    NetInfo.fetch().then(state =>
      setOnlineCheck(state.isConnected)
    );
  };

  const DisplayInternetConnection = () => {
    console.log(onlineCheck);
    if (!onlineCheck) {
      return (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}> Not Connected to the Internet</Text>
        </View>
      );
    }
    return null;
  }

  const updatePostAsync = async (createdAt, editedText) => {
    //replace the post locally
    let tempposts = posts;
    tempposts[tempposts.findIndex(p => p.createdAt == createdAt && p.userId == route.params?.myId)].description = editedText;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPosts(tempposts);

    const post = tempposts.find(p => {return p.createdAt == createdAt && p.userId == route.params?.myId});

    try {
      await API.graphql(graphqlOperation(updatePost, { input: { createdAt: createdAt, description: editedText, parentId: post.parentId, isParent: post.isParent } }));
      console.log("success in updating a post");
    } catch (err) {
      console.log("error in updating post: ", err);
    }
  }

  const addPostAsync = async () => {
    checkInternetConnection();
    console.log("attempting to make new post");
    const newPost = {
      parentId: (new Date(Date.now())).toISOString() + route.params?.myId,
      description: postVal,
      channel: getChannel(),
      isParent: 1,
    };
    if (receiver != null)
      newPost.receiver = receiver;
    setPostVal("");

    console.log(route.params?.myId + " just posted.");

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPosts([{ ...newPost, userId: route.params?.myId, createdAt: (new Date(Date.now())).toISOString() }, ...posts]);

    try {
      API.graphql(graphqlOperation(createPost, { input: newPost }));
      if (receiver != null) {
        //when sending a message, create conversation using specified channel if posts is empty. if not, update conversation with the specified channel.
        if (posts.length == 0) {
          API.graphql(graphqlOperation(createConversation, { input: {id: channel, users: [route.params?.myId, receiver], lastMessage: postVal} }));
        } else {
          API.graphql(graphqlOperation(updateConversation, { input: {id: channel, lastMessage: postVal} }));
        }
      }
    } catch (err) {
      console.log("error in creating post: ", err);
    }
  };

  const replyPostAsync = async (parentID, replyingText) => {
    checkInternetConnection();
    console.log("sent reply");
    console.log("*******************");

    const newPost = {
      parentId: parentID.toString(),
      description: replyingText,
      channel: getChannel(),
      isParent: 0,
    };
    if (receiver != null)
      newPost.receiver = receiver;

    let tempposts = currentPosts.current;
    var index = tempposts.indexOf(tempposts[tempposts.findIndex(p => p.parentId == newPost.parentId)]);
    tempposts.splice(index + 1, 0, {...newPost, userId: route.params?.myId, createdAt: (new Date(Date.now())).toISOString() });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPosts(tempposts);

    try {
      await API.graphql(graphqlOperation(createPost, { input: newPost }));
    } catch (err) {
      console.log("error in creating post: ", err);
    }
  };

  const deletePostsAsync = async (timestamp) => {
    checkInternetConnection();

    let parent_post = posts.find((item) => {
      //const time = timestamp.toString();
      return item.createdAt === timestamp && item.userId === route.params?.myId;
    })

    console.log("parent post: " + parent_post.description);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (parent_post.isParent == 1) {
      setPosts((posts) => {
        return posts.filter((val) => (val.parentId != parent_post.parentId));
      });
    } else {
      setPosts((posts) => {
        return posts.filter((val) => (val.createdAt != parent_post.createdAt || val.userId != parent_post.userId));
      });
    }

    console.log("##########################################");
    console.log(posts);
    console.log("******************************************");

    try {
      await API.graphql(graphqlOperation(deletePost, { input: { createdAt: timestamp, userId: route.params?.myId } }));
    } catch {
      console.log("error in deleting post: ");
    }

  };

  const scrollToTop = () => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APIList
        ListRef={scrollRef}
        ListHeaderComponent={
          <View style={{}}>
            {headerComponent}
            <View style={{flexDirection: "row"}}>
            <ProfileImageAndName
              you={true}
              navigation={false}
              userId={route.params?.myId}
              isFull={true}
              fullname={true}
              hidename={true}
              imageStyle={{
                resizeMode: "cover",
                width: 50,
                height: 50,
                borderRadius: 0,
                alignSelf: "center",
              }}
            />
            <Text style={{ marginTop: 20, marginLeft: 5 }}>
              {" "}
              Characters remaining: {numCharsLeft}{" "}
            </Text>
            </View>
            <TextInput
              style={[
                styles.textInputStyle,
                { marginTop: 5, marginBottom: 30 },
              ]}
              multiline={true}
              placeholder="Start Typing..."
              onChangeText={setPostVal}
              value={postVal}
              clearButtonMode="always"
              maxLength={1000}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 15,
              }}
            >
              {postVal === "" ? (
                <TouchableOpacity
                  style={[
                    styles.unselectedButtonStyle,
                    { flexDirection: "row" },
                  ]}
                  onPress={() => {
                    alert("No text detected in text field");
                  }}
                >
                  <MaterialIcons
                    name="add-circle"
                    size={30}
                    color={"gray"}
                    style={{ marginRight: 0 }}
                  />
                  <Text style={[styles.buttonTextStyle, { color: "gray" }]}>
                    {receiver != null ? "Send Message" : "Add Post" }
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.buttonStyle, {flexDirection: "row", 
                  backgroundColor: "orange",
                  padding: 10,
                  borderRadius: 5,
                  marginHorizontal: 6,}}
                  onPress={addPostAsync}
                >
                <MaterialIcons
                  name="add-circle"
                  size={30}
                  color={"white"}
                  style={{ marginRight: 0 }}
                />
                  <Text style={styles.buttonTextStyle}>
                    {receiver != null ? "Send Message" : "Add Post"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        processingFunction={getLikedPosts}
        queryOperation={postsByChannel}
        setDataFunction={setPosts}
        data={posts}
        filter={{ channel: getChannel(), sortDirection: "DESC" }}
        renderItem={({ item, index }) => (
          <PostItem
            item={item}
            deletePostsAsync={deletePostsAsync}
            writtenByYou={item.userId === route.params?.myId}
            editButtonHandler={updatePostAsync}
            replyButtonHandler={replyPostAsync}
            receiver={receiver}
            showTimestamp={showTimestamp(item, index)}
            newSection={
              index == 0 ? true : showTimestamp(posts[index - 1], index - 1)
            }
          />
        )}
        keyExtractor={(item) => item.createdAt.toString() + item.userId}
      />

      <View
        style={{
          marginBottom: 40,
          position: "absolute",
          alignSelf: "flex-end",
        }}
      >
        <TouchableOpacity onPress={scrollToTop}>
          <MaterialIcons name="arrow-upward" size={38} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};