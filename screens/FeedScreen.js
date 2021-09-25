import React, { useState, useEffect, useRef, PureComponent } from "react";
import {
  Text,
  Image,
  View,
  SafeAreaView,
  LayoutAnimation,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
// Get the aws resources configuration parameters
import { API, graphqlOperation, Cache, Storage } from "aws-amplify";
import { createReport, createPost, updatePost, deletePost, createConversation, updateConversation, deleteConversation } from "root/src/graphql/mutations";
import { postsByChannel, batchGetLikes, getFriendship, getConversations, getConversation } from "root/src/graphql/queries";
import PostItem from "components/PostItem";
import MessageItem from "components/MessageItem";
import { onCreatePostFromChannel, onDeletePostFromChannel, onUpdatePostFromChannel, onCreateLike, onDeleteLike, onIncrementLikes, onDecrementLikes } from 'root/src/graphql/subscriptions';
import NetInfo from '@react-native-community/netinfo';
import APIList from 'components/APIList';
import { MaterialIcons } from '@expo/vector-icons';
import { lessThan } from "react-native-reanimated";
import { ProfileImageAndName } from "components/ProfileImageAndName";
import ExpandingTextInput from "components/ExpandingTextInput";
import SpamButton from "components/SpamButton";
import { getLinkPreview } from 'link-preview-js';
import IconButton from "components/IconButton";

const linkify = require('linkify-it')()
linkify
  .tlds(require('tlds'))          // Reload with full tlds list
  .tlds('mobi', true)            // Add unofficial `.onion` domain


require('root/androidtimerfix');

var styles = require('styles/stylesheet');

var allSettled = require('promise.allsettled');

const viewabilityConfig = {
  minimumViewTime: 150,
  itemVisiblePercentThreshold: 66,
  waitForInteraction: false,
}

export default function FeedScreen({ navigation, route, receiver, channel, headerComponent, originalParentId, Accepted, lastUser, sidebar, id, autoFocus = false }
) {
  const [posts, setPosts] = useState([]);

  const [onlineCheck, setOnlineCheck] = useState(true);
  const [ButtonCheck, setButtonCheck] = useState(false);

  const currentPosts = useRef();
  const scrollRef = useRef(); // Used to help with automatic scrolling to top

  currentPosts.current = posts;

  useEffect(() => {

    const onFocus = navigation.addListener('focus', () => {
      if (receiver == null) {
        navigation.setOptions({
          headerLeft: () =>
            <ProfileImageAndName
              you={true}
              navigateToProfile={false}
              userId={route.params?.myId}
              isFull={true}
              fullname={true}
              hidename={true}
              imageSize={30}
              style={{ marginLeft: 15 }}
            />
        })
      }
    });
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return onFocus;
  }, [navigation])

  const checkButton = async () => {

    let namesArray = [route.params?.myId, receiver];
    namesArray.sort();

    let temp = namesArray[0] + namesArray[1];

    let newConversations1 = await API.graphql(graphqlOperation(getConversation, { id: temp }));

    newConversations1 = newConversations1.data.getConversation;

    if (newConversations1 == null) {
      setButtonCheck(true);
    }
    else if (newConversations1.Accepted) {
      setButtonCheck(true);
    }
    else {
      setButtonCheck(false);
    }


    //let checkConversationExists = newConversations1.find(item => (item.users[0] === route.params?.myId && item.users[1] === receiver) || (item.users[0] === receiver && item.users[1] === route.params?.myId));
    //let checkMessageRequestExists = newConversations2.find(item => (item.users[0] === route.params?.myId && item.users[1] === receiver) || (item.users[0] === receiver && item.users[1] === route.params?.myId));
  }

  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      checkButton();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return onFocus;
  }, [navigation])

  /*
    useEffect(() => {
      console.log("hello");
      checkButton();
    }, [])
    */



  useEffect(() => {
    const createPostSubscription = API.graphql(graphqlOperation(onCreatePostFromChannel, { channel: channel })).subscribe({
      next: event => {
        const newPost = event.value.data.onCreatePostFromChannel
        if (!currentPosts.current.find(post => post.userId === newPost.userId && post.createdAt === newPost.createdAt)) { //acts as validation, maybe disable textinput while this happens
          newPost.likes = newPost.likes ?? 0;
          newPost.replies = newPost.replies ?? 0;
          if (newPost.userId === route.params?.myId) {
            console.log("received own post again")
            setPosts(posts => posts.map(post => {
              if (post.userId === route.params?.myId && post.createdAt == "null") return newPost
              else return post;
            }));
          }
          else {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setPosts(posts => [newPost, ...posts]); //what if we have a lot of new posts at once?
          }
        }
      }
    });
    const deletePostSubscription = API.graphql(graphqlOperation(onDeletePostFromChannel, { channel: channel })).subscribe({
      next: event => {
        const deletedPost = event.value.data.onDeletePostFromChannel
        if (deletedPost.userId != route.params?.myId) {//acts as validation, maybe disable textinput while this happens
          if (currentPosts.current.find(post => post.userId === deletedPost.userId && post.createdAt === deletedPost.createdAt)) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setPosts(posts => {
              var index = posts.findIndex(post => post.userId === deletedPost.userId && post.createdAt === deletedPost.createdAt);
              posts.splice(index, 1);
              return posts;
            });
          }
        }
      }
    });
    const updatePostSubscription = API.graphql(graphqlOperation(onUpdatePostFromChannel, { channel: channel })).subscribe({ //nvm we dont have a subscription event for incrementlike
      next: event => {
        //console.log("post has been updated");
      }
    });
    checkInternetConnection();
    return () => {
      createPostSubscription.unsubscribe();
      deletePostSubscription.unsubscribe();
      updatePostSubscription.unsubscribe();
    }
  }, []);

  const getLikedPosts = async (newPosts) => {
    let postIds = [];

    newPosts.forEach(item => {
      postIds.push({ postId: item.createdAt + "#" + item.userId });
    });

    try {
      await allSettled([
        API.graphql(graphqlOperation(batchGetLikes, { likes: postIds })).then((likes) => {
          //console.log("looking for likes: ", likes);
          //returns an array of like objects or nulls corresponding with the array of newposts
          for (i = 0; i < newPosts.length; ++i) {
            if (newPosts[i].likes == null) {
              newPosts[i].likes = 0;
            }
            if (likes.data.batchGetLikes[i] != null) {
              //console.log("found liked post");
              newPosts[i].likedByYou = true;
            } else {
              newPosts[i].likedByYou = false;
            }
          }
        }),

        allSettled(newPosts.map((post) => Cache.getItem(post.userId))).then((results) => {
          //console.log("all are complete")
          for (i = 0; i < newPosts.length; ++i) {
            if (results[i].status === "fulfilled") {
              newPosts[i].info = results[i].value;
            } else {
              newPosts[i].info = { error: true }
            }
          }
        }),

        allSettled(newPosts.map((post) => {
          if (linkify.pretest(post.description) && linkify.test(post.description))
            return getLinkPreview(linkify.match(post.description)[0].url, {
              headers: {
                "user-agent": "googlebot" // fetches with googlebot crawler user agent
              }
            })
          else
            return Promise.reject()
        })).then((results) => {
          //console.log(results)
          for (i = 0; i < newPosts.length; ++i) {
            if (results[i].status === "fulfilled") {
              newPosts[i].urlPreview = results[i].value;
            }
          }
        }),
      ]);

      //console.log(newPosts[0])

      return newPosts;

      //we can also check if the item contains a link and load the link preview data through here as well, and insert it into the postitem
      //link previews should have a fixed height btw, or at least a max height. but then it could vary between 0 and the max height
    } catch (err) {
      console.log("error in detecting likes: ", err);
    }
  }

  const showTimestamp = (item, index) => {
    return index >= posts.length - 1 || ((((new Date(item.createdAt).getTime() - new Date(posts[index + 1].createdAt).getTime()) / 1000) / 60) / 60 > 1);
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
    setPosts((posts) => {
      posts.find(p => { return p.createdAt == createdAt && p.userId == route.params?.myId }).description = editedText;
      return posts;
    });

    try {
      await API.graphql(graphqlOperation(updatePost, { input: { createdAt: createdAt, description: editedText } }));
      console.log("success in updating a post");
    } catch (err) {
      console.log("error in updating post: ", err);
    }
  }

  const acceptMessageRequest = async () => {
    await API.graphql(graphqlOperation(updateConversation, { input: { id: channel, Accepted: 1 } }));
    setButtonCheck(true);
  }

  const rejectMessageRequest = async () => {
    await API.graphql(
      graphqlOperation(deleteConversation, {
        input: { id: id }
      })
    );
    navigation.navigate("Conversations");
  }

  /*
  const addPostAsync = async (parentId, replyText) => {
    checkInternetConnection();

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPosts((posts) => {
      return posts.filter((post) => (post.createdAt !== timestamp || post.userId !== route.params?.myId));
    });

    try {
      await API.graphql(graphqlOperation(deletePost, { input: { createdAt: timestamp, userId: route.params?.myId } }));
    } catch {
      console.log("error in deleting post: ");
    }
  };
  */


  const deletePostsAsync = async (timestamp) => {
    checkInternetConnection();

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPosts((posts) => {
      return posts.filter((post) => (post.createdAt !== timestamp || post.userId !== route.params?.myId));
    });

    try {
      await API.graphql(graphqlOperation(deletePost, { input: { createdAt: timestamp, userId: route.params?.myId } }));
    } catch {
      console.log("error in deleting post: ");
    }
  };


  const reportPost = async (timestamp, author) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPosts((posts) => {
      return posts.filter((post) => (post.createdAt !== timestamp || post.userId !== author));
    });

    try {
      await API.graphql(graphqlOperation(createReport, { input: { postId: timestamp + "#" + author, userId: route.params?.myId } }));
    } catch (err) {
      console.log("error in reporting post: ", err);
    }
  }

  const scrollToTop = () => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  const renderPostItem = ({ item, index }) => {
    if (item.loading) return (
      <ActivityIndicator
        size="large"
        color="#26c6a2"
        style={{
          flex: 1,
          justifyContent: "center",
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 20,
        }} />
    )
    else if (receiver != null) return (
      <MessageItem
        index={index}
        item={item}
        likes={item.likes}
        replies={item.replies}
        deletePostsAsync={deletePostsAsync}
        writtenByYou={item.userId === route.params?.myId}
        myId={route.params?.myId}
        editButtonHandler={updatePostAsync}
        receiver={receiver}
        showTimestamp={showTimestamp(item, index)}
        reportPost={reportPost}
        newSection={
          index == 0 ? true : showTimestamp(posts[index - 1], index - 1)
        }
        isVisible={item.isVisible}
        shouldSubscribe={item.shouldSubscribe}
      />
    )
    else return (
      <PostItem
        index={index}
        item={item}
        likes={item.likes}
        replies={item.replies}
        deletePostsAsync={deletePostsAsync}
        writtenByYou={item.userId === route.params?.myId}
        myId={route.params?.myId}
        editButtonHandler={updatePostAsync}
        receiver={receiver}
        showTimestamp={showTimestamp(item, index)}
        reportPost={reportPost}
        newSection={
          index == 0 ? true : showTimestamp(posts[index - 1], index - 1)
        }
        isVisible={item.isVisible}
        shouldSubscribe={item.shouldSubscribe}
      />
    )
  }

  const onViewableItemsChanged = React.useCallback(({ viewableItems, changedItems }) => {
    //console.log("viewable items have changed")

    if (viewableItems.length <= 0) return;

    //find the index in the posts array of the first item in viewableitems.
    const firstViewableIndex = posts.findIndex(post => viewableItems[0].key === post.createdAt.toString() + post.userId); //use currentposts?
    //record that starting index

    //loop through the posts array until we hit startingindex - 20 and turn off subscription flags
    //turn on subscription flags until we hit startingindex + viewableitems.length + 20
    let currentIndex = 0;
    setPosts(posts => posts.map((post, index) => {
      //we'll activate real time updates for posts just out of view
      if ((index < firstViewableIndex && index >= firstViewableIndex - 10) || (index > firstViewableIndex + viewableItems.length && index <= firstViewableIndex + viewableItems.length + 10)) {
        post.shouldSubscribe = true;
      } else {
        post.shouldSubscribe = false;
      }

      post.isVisible = false;
      if (viewableItems[currentIndex] && viewableItems[currentIndex].key === post.createdAt.toString() + post.userId) {
        //grab the middle of the index, that's the video that should be playing (if there is any)
        //console.log("turning post visible")
        ++currentIndex;
        post.isVisible = true;
      }

      return post;
    }));

    //in the postitem have a useeffect listening for the subscription flag to turn on and off subscriptions for that post
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <APIList
        viewabilityConfig={viewabilityConfig}
        ListRef={scrollRef}
        ListHeaderComponent={

          <View style={{}}>
            {headerComponent}
            {lastUser != route.params.myId && lastUser != null && receiver != null && !ButtonCheck ?
              <View style={styles.signOutTop}>
                <TouchableOpacity
                  onPress={acceptMessageRequest}
                  style={styles.acceptMessageButton}
                >
                  <Text style={styles.acceptButtonTextStyle}>
                    Accept
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={rejectMessageRequest}
                  style={styles.rejectMessageButton}
                >
                  <Text style={styles.rejectButtonTextStyle}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>
              : null
            }

            {Accepted || ButtonCheck || receiver == null || lastUser == route.params.myId || sidebar || lastUser == undefined ?
              <PostInputField
                channel={channel}
                headerComponent={headerComponent}
                receiver={receiver}
                myId={route.params?.myId}
                originalParentId={originalParentId}
                pushLocalPost={(localNewPost) => setPosts((posts) => [localNewPost, ...posts])}
                autoFocus={autoFocus}
              /> : null
            }
          </View>
        }
        initialAmount={7}
        additionalAmount={7} //change number based on device specs
        processingFunction={getLikedPosts}
        queryOperation={postsByChannel}
        setDataFunction={setPosts}
        data={posts}
        filter={{ channel: channel, sortDirection: "DESC" }}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.createdAt.toString() + item.userId}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </SafeAreaView>
  );
};

import usePhotos from '../hooks/usePhotos';
import * as ImageManipulator from 'expo-image-manipulator';
import SHA256 from "hooks/hash";
import { Video, AVPlaybackStatus } from 'expo-av';

function PostInputField({ channel, headerComponent, receiver, myId, originalParentId, pushLocalPost, autoFocus = false }) {
  const [pickFromGallery, pickFromCamera] = usePhotos(true);
  const [postInput, setPostInput] = useState("");
  const [imageURL, setImageURL] = useState(null);
  const [isVideo, setIsVideo] = useState(null);
  const [postIsLoading, setPostIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  let animation = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation.current, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false // Add This line
    }).start();
  }, [progress])

  const width = animation.current.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp"
  })

  const addPostAsync = async () => {
    //console.log("current date is ", Date.now());
    setPostIsLoading(true);

    const imageID = SHA256(Date.now().toString());

    const newPost = {
      description: postInput,
      channel: channel,
    };
    if (receiver != null) {
      newPost.receiver = receiver;
    }
    if (originalParentId != null) {
      newPost.parentId = originalParentId;
    }
    if (imageURL !== null) {
      const re = /(?:\.([^.]+))?$/;
      const videoExtension = re.exec(imageURL)[1];

      newPost.imageURL = `${imageID}.${isVideo ? videoExtension : 'jpg'}`;
    }
    const localNewPost = {
      ...newPost,
      userId: myId,
      createdAt: "null",
      loading: true
    }
    setPostInput("");

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    pushLocalPost(localNewPost);

    if (newPost.receiver) global.updateFriendsListWithMyNewMessage(newPost);
    //if (global.updatemessagescreen)
    //global.updateMessageScreen
    //if global.updateconversationscreen
    //global.updateConversationScreen

    try {
      //first, we must upload the image if any
      if (imageURL !== null) {
        let blob;
        if (!isVideo) {
          const resizedPhoto = await ImageManipulator.manipulateAsync(
            imageURL,
            [{ resize: { width: 500 } }],
            { compress: 1, format: 'jpeg' },
          );
          const response = await fetch(resizedPhoto.uri);
          blob = await response.blob();
        } else {
          const response = await fetch(imageURL);
          blob = await response.blob();
        }

        //scan the uri and check filetype. maybe console log the uri first
        const re = /(?:\.([^.]+))?$/;
        const videoExtension = re.exec(imageURL)[1];
        setProgress(0.01);
        await Storage.put(`feed/${imageID}.${isVideo ? videoExtension : 'jpg'}`, blob, {
          progressCallback(progress) {
            setProgress(progress.loaded / progress.total);
            //console.log(progress); //what is "part"
          },
          level: 'public', contentType: isVideo ? 'video/' + videoExtension : 'image/jpeg'
        }); //make sure people can't overwrite other people's photos, and preferrably not be able to list all the photos in s3 using brute force. may need security on s3
        setProgress(0);
        setImageURL(null);
      }

      if (receiver) {
        const friend1 = await API.graphql(graphqlOperation(getFriendship, { sender: myId, receiver: receiver }));
        const friend2 = await API.graphql(graphqlOperation(getFriendship, { sender: receiver, receiver: myId }));

        let newConversations1 = await API.graphql(graphqlOperation(getConversations, { Accepted: 1 }))
        let newConversations2 = await API.graphql(graphqlOperation(getConversations, { Accepted: 0 }))

        newConversations1 = newConversations1.data.getConversations.items
        newConversations2 = newConversations2.data.getConversations.items

        let checkConversationExists = newConversations1.find(item => item.id === newPost.channel);

        if (checkConversationExists == null) {
          checkConversationExists = newConversations2.find(item => item.id === newPost.channel);
        }

        const friendCheck = () => {
          return (friend1 != null ? friend1 : friend2);
        }

        const friend = friendCheck();

        let users = [myId, receiver].sort();

        if (checkConversationExists == null) {
          if (friend1.data.getFriendship === null && friend2.data.getFriendship === null) {
            await API.graphql(graphqlOperation(createConversation, { input: { id: channel, users: users, lastMessage: postInput, Accepted: 0 } }));
          }
          else if (friend.data.getFriendship.accepted === null) {
            await API.graphql(graphqlOperation(createConversation, { input: { id: channel, users: users, lastMessage: postInput, Accepted: 0 } }));
          }
          else {
            await API.graphql(graphqlOperation(createConversation, { input: { id: channel, users: users, lastMessage: postInput, Accepted: 1 } }));
          }
        }
        else if (localNewPost.userId != checkConversationExists.lastUser) {
          await API.graphql(graphqlOperation(updateConversation, { input: { id: newPost.channel, lastMessage: postInput, Accepted: 1 } }));
        }
        else {
          await API.graphql(graphqlOperation(updateConversation, { input: { id: channel, lastMessage: postInput } }));
        }
      }

      API.graphql(graphqlOperation(createPost, { input: newPost }));
    } catch (err) {
      console.warn("error in creating post: ", err);
    }

    setPostIsLoading(false);
  };

  return (
    <View style={{ backgroundColor: "#a9efe0" }}>

      {
        //headerComponent
      }


      {
        imageURL !== null ?
          isVideo ?
            <Video
              style={{
                resizeMode: "cover",
                width: 450,
                height: 450,
                alignSelf: "center",
              }} //check if this should be an image or a video?
              useNativeControls
              isLooping
              shouldPlay
              source={{ uri: imageURL }} //need a way to delete the image too
              posterSource={require("../assets/icon.png")}
            /> :
            <Image
              style={{
                resizeMode: "cover",
                width: 450,
                height: 450,
                alignSelf: "center",
              }} //check if this should be an image or a video?
              source={{ uri: imageURL }} //need a way to delete the image too
            /> : null
      }

      <ExpandingTextInput
        style={[
          styles.textInputStyle,
          { marginTop: 5, marginBottom: 5 },
        ]}
        autoFocus={autoFocus}
        multiline={true}
        placeholder={progress > 0 ? "Uploading..." : "Start typing..."}
        onChangeText={setPostInput}
        value={postInput}
        clearButtonMode="always"
        maxLength={1000}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 15, marginTop: 2, marginBottom: 10 }}>
        <View style={{ flexDirection: "row" }}>
          <IconButton
            iconName={"insert-photo"}
            size={20}
            color={imageURL === null || postIsLoading ? "gray" : "blue"}
            style={{ marginRight: 6 }}
            onPress={() => pickFromGallery(setImageURL, null, setIsVideo)}
          />
          <IconButton
            iconName={"camera-alt"}
            size={20}
            style={{ marginRight: 6 }}
            color={imageURL === null || postIsLoading ? "gray" : "blue"}
            onPress={() => pickFromCamera(setImageURL, null, setIsVideo)}
          />
          {
            imageURL != null ?
              <IconButton
                iconName={"close"}
                size={20}
                color={imageURL === null || postIsLoading ? "gray" : "blue"}
                onPress={() => setImageURL(null)}
              /> : null
          }
        </View>
        <IconButton
          iconName={(postInput === "" && imageURL === null) || postIsLoading ? "add-circle-outline" : "add-circle"}
          size={15}
          color={(postInput === "" && imageURL === null) || postIsLoading ? "gray" : "blue"}
          label={receiver != null ? "Send Message" : "Add Post"}
          onPress={postIsLoading ? () => {
            alert("Currently uploading a post");
          } : postInput === "" && imageURL === null ? () => {
            alert("No text detected in text field");
          } : addPostAsync}
        />
      </View>

      {
        progress > 0 ?
          <View style={{
            height: 30,
            backgroundColor: 'white',
            margin: 15,
            borderRadius: 5,
          }}>
            <Animated.View style={[{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }, { backgroundColor: "#26c6a2", width }]} />
            <Text
              style={{
                alignSelf: "center",
                justifyContent: "center",
                color: "black",
                fontWeight: "bold",
                fontSize: 15,
                marginTop: 5,
              }}>
              Uploading...
            </Text>
          </View> : null
      }

      {
        <View
          style={{
            top: 50,
            position: "absolute",
            alignSelf: "flex-end",
          }}
        >
          <SpamButton func={addPostAsync} />
        </View>
      }
    </View>
  )
}