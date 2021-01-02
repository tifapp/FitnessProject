import { StatusBar } from "expo-status-bar";
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
  SafeAreaView
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "root/src/graphql/mutations";
import { listPosts, postsByGroup } from "root/src/graphql/queries";
import PostItem from "components/PostItem";
import { onCreatePost, onDeletePost, onUpdatePost } from 'root/src/graphql/subscriptions';
import NetInfo from '@react-native-community/netinfo';
import APIList from 'components/APIList';
import { AntDesign } from '@expo/vector-icons';

require('root/androidtimerfix');

Amplify.configure(awsconfig);

var styles = require('styles/stylesheet');

export default function FeedScreen({ navigation, route }) {
  const { group } = route.params;
  const [postVal, setPostVal] = useState("");
  const [posts, setPosts] = useState([]);
  const numCharsLeft = 1000 - postVal.length;
  const [isReplying, setIsReplying] = useState(false);
  const [updatePostID, setUpdatePostID] = useState(0);

  const [onlineCheck, setOnlineCheck] = useState(true);

  const currentPosts = useRef();
  const scrollRef = useRef(); // Used to help with automatic scrolling to top

  useEffect(() => {
    waitForNewPostsAsync();
    checkInternetConnection();
  }, []);

  const checkInternetConnection = () => {
    NetInfo.fetch().then(state =>
      setOnlineCheck(state.isConnected)
    );
  };

  const sortPosts = (r) => {
    console.log("Inside sortPosts");
    let results = r;
    let parents = r;

    console.log(results);

    parents = parents.filter((item) => item.parentId == null || item.parentId == "");
    let checker = 0;

    for (let post of results) {
      //console.log("inside loop");
      let parent_post = results.find((item) => {
        const id = item.userId + "#" + item.timestamp.toString();
        return id === post.parentId;
      })

      if (parent_post != null) {
        var index = results.indexOf(results[results.findIndex(p => p.userId + "#" + p.timestamp.toString() == post.parentId)]);
        var childIndex = results.indexOf(post);
        checker = 1;

        results.splice(childIndex, 1);
        results.splice(index + 1, 0, post);

        console.log("***********************************");
        console.log(results);
        console.log("***********************************");

      }
    }

    if (checker == 0) {
      return parents;
    }

    return results;
  }

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

  currentPosts.current = posts;

  const waitForNewPostsAsync = async () => {
    await API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: event => {
        const newPost = event.value.data.onCreatePost
        if (newPost.parentId != "" && newPost.parentId != null) {
          /*
          let tempposts = [...currentPosts.current];
          var index = tempposts.indexOf(tempposts[tempposts.findIndex(p => p.parentId == newPost.parentId)]);
          console.log("Index: " + index);

          */
          let tempposts = [...currentPosts.current];
          var index = tempposts.indexOf(tempposts[tempposts.findIndex(p => p.userId + "#" + p.timestamp.toString() == newPost.parentId)]);
          tempposts.splice(index + 1, 0, newPost);
          setPosts(tempposts);
        }
        else if (newPost.userId != route.params?.id && (group != null ? newPost.group == group.id : 'general' == newPost.group)) { //uhoh security issue, we shouldnt be able to see other group's posts //acts as validation, maybe disable textinput while this happens
          setPosts([newPost, ...currentPosts.current]); //for some reason "posts" isn't the most uptodate version. will we need a ref???!?!?!? //what if we have a lot of new posts at once?
        }
      }
    });
    await API.graphql(graphqlOperation(onDeletePost)).subscribe({
      next: newPost => {
        //if (!didUserPost) {
        //check if newpost is earlier than the earliest post in the array first.
        //if so, we won't even need to rerender anything
        //if not, loop through the posts array to find the one that matches newpost and replace it!
        //showPostsAsync();
        //}
      }
    });
    await API.graphql(graphqlOperation(onUpdatePost)).subscribe({
      next: newPost => {
        //if (!didUserPost) {
        //check if newpost is earlier than the earliest post in the array first.
        //if so, we won't even need to rerender anything
        //if not, loop through the posts array to find the one that matches newpost and replace it!
        //showPostsAsync();
        //}
      }
    });
  }

  // This function now also has functionality for updating a post
  // We can separate updating functionality from adding functionality if it
  // becomes an issue later on.
  const addPostAsync = async (val) => {
    checkInternetConnection();
    if (updatePostID != 0) {
      //replace the post locally
      let tempposts = [...posts];
      tempposts[tempposts.findIndex(p => p.timestamp == updatePostID && p.userId == route.params?.id)].description = postVal;
      setPosts(tempposts);

      try {
        await API.graphql(graphqlOperation(updatePost, { input: { timestamp: updatePostID, userId: route.params?.id, description: postVal } }));
        console.log("success in updating a post");
      } catch (err) {
        console.log("error in updating post: ", err);
      }

      setPostVal("");
      setUpdatePostID(0);
    }
    else {
      const newPost = {
        timestamp: Math.floor(Date.now() / 1000),
        userId: route.params?.id,
        parentId: "",
        description: postVal,
        group: group != null ? group.id : 'general',
      };
      setPostVal("");

      setPosts([newPost, ...posts]);
      try {
        await API.graphql(graphqlOperation(createPost, { input: newPost }));
        console.log("success in making a new post, group is false? ", group == null);
      } catch (err) {
        console.log("error in creating post: ", err);
      }
      //console.log("current time...", );
    }

  };

  const replyPostAsync = async (postID) => {
    checkInternetConnection();
    console.log("I'm in reply");
    console.log("*******************");

    const newPost = {
      timestamp: Math.floor(Date.now() / 1000),
      userId: route.params?.id,
      parentId: postID.toString(),
      description: postVal,
      group: group != null ? group.id : 'general',
    };

    setPostVal("");

    try {
      await API.graphql(graphqlOperation(createPost, { input: newPost }));
      console.log("success in making a new post, group is false? ", group == null);
    } catch (err) {
      console.log("error in creating post: ", err);
    }

    setIsReplying(false);
    setUpdatePostID(0);


  };

  const deletePostsAsync = async (timestamp) => {
    checkInternetConnection();

    console.log("deleting the post with this timestamp: ", timestamp);
    //locally removes the post
    setPosts((posts) => {
      return posts.filter((val) => (val.timestamp != timestamp || val.userId != route.params?.id));
    });

    setUpdatePostID(0);

    //sends a request to remove the post from the server
    try {
      await API.graphql(graphqlOperation(deletePost, { input: { timestamp: timestamp, userId: route.params?.id } }));
    } catch {
      console.log("error in deleting post: ");
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  return (
    <SafeAreaView style={{ flex: 1 }} >
      <APIList
        ListRef={scrollRef}
        ListHeaderComponent={
              <View style={{}}>
                <Text style={{ marginTop: 20, marginLeft: 5 }}> Characters remaining: {numCharsLeft} </Text>
                <TextInput
                  style={[styles.textInputStyle, { marginTop: 5, marginBottom: 30 }]}
                  multiline={true}
                  placeholder="Start Typing..."
                  onChangeText={setPostVal}
                  value={postVal}
                  clearButtonMode="always"
                  maxLength={1000}
                />

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: 15,
                }}>
                  {!isReplying ?
                    <TouchableOpacity
                      style={styles.buttonStyle}
                      onPress={() => {
                        postVal != ""
                          ? (addPostAsync(updatePostID))
                          : alert("No text detected in text field");
                      }}
                    >
                      <Text style={styles.buttonTextStyle}>{updatePostID == 0 ? 'Add Post' : 'Edit Post'}</Text>
                    </TouchableOpacity> :
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginBottom: 15,
                      marginHorizontal: 40,
                      justifyContent: 'space-evenly'
                    }}>
                      <TouchableOpacity
                        style={[styles.buttonStyle]}
                        onPress={() => {
                          postVal != ""
                            ? (replyPostAsync(updatePostID))
                            : alert("No text detected in text field");
                        }}
                      >
                        <Text style={styles.buttonTextStyle}>Reply To Post</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.buttonStyle}
                        onPress={() => {
                          setIsReplying(false),
                          setUpdatePostID(0)
                        }}
                      >
                        <Text style={styles.buttonTextStyle}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  }
                </View>
              </View>
        }
        processingFunction={sortPosts}
        queryOperation={postsByGroup}
        setDataFunction={setPosts}
        data={posts}
        filter={{ group: group != null ? group.id : 'general', sortDirection: 'DESC' }}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            deletePostsAsync={deletePostsAsync}
            writtenByYou={item.userId === route.params?.id}
            setPostVal={setPostVal}
            setIsReplying={setIsReplying}
            setUpdatePostID={setUpdatePostID}
            parentID={item.parentId}
          />
        )}
        keyExtractor={(item, index) => item.timestamp.toString() + item.userId}
      />

      <StatusBar style="auto" />

      <View style={{ marginBottom: 40, position: 'absolute', alignSelf: 'flex-end' }}>
        <TouchableOpacity onPress={scrollToTop}>
          <AntDesign name="arrowup" size={38} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};