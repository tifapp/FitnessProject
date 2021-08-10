import React, { useState, useEffect, useRef, PureComponent } from "react";
import {
  Text,
  Image,
  View,
  SafeAreaView,
  LayoutAnimation,
} from "react-native";
// Get the aws resources configuration parameters
import { API, graphqlOperation, Cache } from "aws-amplify";
import { createReport, createPost, updatePost, deletePost, createConversation, updateConversation } from "root/src/graphql/mutations";
import { postsByChannel, batchGetLikes, getFriendship, getConversations } from "root/src/graphql/queries";
import PostItem from "components/PostItem";
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

export default function FeedScreen({ navigation, route, receiver, channel, headerComponent, originalParentId }) {
  const [posts, setPosts] = useState([]);

  const [onlineCheck, setOnlineCheck] = useState(true);

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
              style={{marginLeft: 15}}
            />
        })
      }
    });
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return onFocus;
  }, [navigation])

  useEffect(() => {
    const createPostSubscription = API.graphql(graphqlOperation(onCreatePostFromChannel, { channel: channel })).subscribe({
      next: event => {
        const newPost = event.value.data.onCreatePostFromChannel
        if (!currentPosts.current.find(post => post.userId === newPost.userId && post.createdAt === newPost.createdAt)) { //acts as validation, maybe disable textinput while this happens
          newPost.likes = newPost.likes ?? 0;
          newPost.replies = newPost.replies ?? 0;
          if (newPost.userId === route.params?.myId) {
            console.log("received own post again")
            setPosts(currentPosts.current.map(post => {
              if (post.userId === route.params?.myId && post.createdAt == "null") return newPost
              else return post;
            }));
          }
          else if (newPost.parentId != null) {
            if (currentPosts.current.length > 0 && currentPosts.current.find(post => post.channel === newPost.channel)) {
              let tempposts = currentPosts.current;
              var index = tempposts.indexOf(tempposts[tempposts.findIndex(p => p.channel === newPost.channel)]);
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
    const deletePostSubscription = API.graphql(graphqlOperation(onDeletePostFromChannel, { channel: channel })).subscribe({
      next: event => {
        const deletedPost = event.value.data.onDeletePostFromChannel
        if (deletedPost.userId != route.params?.myId) {//acts as validation, maybe disable textinput while this happens
          if (currentPosts.current.find(post => post.userId === deletedPost.userId && post.createdAt === deletedPost.createdAt)) {
            let tempposts = currentPosts.current;
            var index = tempposts.findIndex(post => post.userId === deletedPost.userId && post.createdAt === deletedPost.createdAt);
            tempposts.splice(index, 1);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setPosts(tempposts);
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

  const renderPostItem = React.useCallback(({ item, index }) => (
    <PostItem
      index={index}
      item={item}
      deletePostsAsync={deletePostsAsync}
      writtenByYou={item.userId === route.params?.myId}
      editButtonHandler={updatePostAsync}
      receiver={receiver}
      showTimestamp={showTimestamp(item, index)}
      reportPost={reportPost}
      newSection={
        index == 0 ? true : showTimestamp(posts[index - 1], index - 1)
      }
    />
  ), [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APIList
        ListRef={scrollRef}
        ListHeaderComponent={
          <PostInputField
          channel={channel}
          headerComponent={headerComponent}
          receiver={receiver}
          myId={route.params?.myId}
          originalParentId={originalParentId}
          pushLocalPost={(localNewPost) => setPosts((posts) => [localNewPost, ...posts])}
          />
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
      />
      {
        /*
      <View
        style={{
          top: 50,
          position: "absolute",
          alignSelf: "flex-end",
        }}
      >
        <SpamButton func={addPostAsync} />
      </View>
        */
      }
    </SafeAreaView>
  );
};

import usePhotos from '../hooks/usePhotos';

function PostInputField({channel, headerComponent, receiver, myId, originalParentId, pushLocalPost}) {
  const [pickFromGallery, pickFromCamera] = usePhotos();
  const [postInput, setPostInput] = useState("");
  const [imageURL, setImageURL] = useState(null);
  
  const addPostAsync = async () => {
    const newPost = {
      description: postInput,
      channel: channel,
    };
    const localNewPost = {
      ...newPost,
      userId: myId, 
      createdAt: "null", 
      loading: true
    }
    if (originalParentId != null) {
      localNewPost.parentId = originalParentId
    }
    if (receiver != null) {
      localNewPost.receiver = receiver;
    }
    setPostInput("");

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    pushLocalPost(localNewPost);

    let users = [myId, receiver].sort();

    try {
      API.graphql(graphqlOperation(createPost, { input: newPost }));

      const friend1 = await API.graphql(graphqlOperation(getFriendship, { sender: myId, receiver: receiver }));
      const friend2 = await API.graphql(graphqlOperation(getFriendship, { sender: receiver, receiver: myId }));

      let newConversations1 = await API.graphql(graphqlOperation(getConversations, { Accepted: 1 }))
      let newConversations2 = await API.graphql(graphqlOperation(getConversations, { Accepted: 0 }))

      newConversations1 = newConversations1.data.getConversations.items
      newConversations2 = newConversations2.data.getConversations.items

      let checkConversationExists = newConversations1.find(item => item.id === channel);

      if (checkConversationExists == null) {
        checkConversationExists = newConversations2.find(item => item.id === channel);
      }

      if (checkConversationExists == null) {
        if (friend1.data.getFriendship == undefined && friend2.data.getFriendship == undefined) {
          await API.graphql(graphqlOperation(createConversation, { input: { id: channel, users: users, lastMessage: postInput, Accepted: 0 } }));
        }
        else {
          await API.graphql(graphqlOperation(createConversation, { input: { id: channel, users: users, lastMessage: postInput, Accepted: 1 } }));
        }
      }
      else if (localNewPost.userId != checkConversationExists.lastUser) {
        await API.graphql(graphqlOperation(updateConversation, { input: { id: channel, lastMessage: postInput, Accepted: 1 } }));
      }
      else {
        await API.graphql(graphqlOperation(updateConversation, { input: { id: channel, lastMessage: postInput } }));
      }

      if (receiver != null) {
        //when sending a message, create conversation using specified channel if posts is empty. if not, update conversation with the specified channel.
        if (posts.length == 0) {
          //API.graphql(graphqlOperation(createConversation, { input: {id: channel, users: users, lastMessage: postInput} }));
        } else {
          await API.graphql(graphqlOperation(updateConversation, { input: { id: channel, lastMessage: postInput } }));
        }
      }
    } catch (err) {
      console.log("error in creating post: ", err);
    }
  };

  return (  
    <View>
      {headerComponent}

      {
        imageURL !== null ?
        <Image
          style={{
            resizeMode: "cover",
            width: 450,
            height: 450,
            alignSelf: "center",
          }}
          source={{ uri: imageURL }} //need a way to delete the image too
        /> : null
      }

      <ExpandingTextInput
        style={[
          styles.textInputStyle,
          { marginTop: 5, marginBottom: 5 },
        ]}
        multiline={true}
        placeholder="Start Typing..."
        onChangeText={setPostInput}
        value={postInput}
        clearButtonMode="always"
        maxLength={1000}
      />

      <View style={{flexDirection: "row", justifyContent: "space-between", marginHorizontal: 15, marginTop: 2, marginBottom: 10}}>
        <View style={{flexDirection: "row"}}>
          <IconButton
            iconName={"insert-photo"}
            size={20}
            color={imageURL === null ? "gray" : "blue"}
            style={{marginRight: 6}}
            onPress={() => pickFromGallery(setImageURL)}
          />
          <IconButton
            iconName={"camera-alt"}
            size={20}
            color={imageURL === null ? "gray" : "blue"}
            onPress={() => pickFromCamera(setImageURL)}
          />
        </View>
        <IconButton
          iconName={postInput === "" ? "add-circle-outline" : "add-circle"}
          size={15}
          color={postInput === "" ? "gray" : "blue"}
          label={receiver != null ? "Send Message" : "Add Post"}
          onPress={postInput === "" ? () => {
            alert("No text detected in text field");
          } : addPostAsync}
        />
      </View>
    </View>
  )
}