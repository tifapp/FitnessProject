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
  FlatList,
  ActivityIndicator,
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "root/src/graphql/mutations";
import { postsByGroup } from "root/src/graphql/queries";
import PostItem from "components/PostItem";
import { onCreatePost, onDeletePost, onUpdatePost } from 'root/src/graphql/subscriptions';
import NetInfo from '@react-native-community/netinfo';

require('root/androidtimerfix');

Amplify.configure(awsconfig);

var styles = require('styles/stylesheet');

export default function FeedScreen({ navigation, route }) {
  const { group } = route.params;
  const [postDescription, setPostDescription] = useState("");
  const numCharsLeft = 1000 - postDescription.length;
  const [updatePostID, setUpdatePostID] = useState(0);
  const [didUserPost, setDidUserPost] = useState(false);
  const [onlineCheck, setOnlineCheck] = useState(true);
  
  useEffect(() => {
    checkInternetConnection();
    waitForNewPostsAsync();
  }, []);
  
  const checkInternetConnection = () => {
    NetInfo.fetch().then(state => 
      setOnlineCheck(state.isConnected)
    );
  };

  const DisplayInternetConnection = () => {
    console.log(onlineCheck);
    if(!onlineCheck){
      return (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}> Not Connected to the Internet</Text>
        </View>
      );
    }
    return null;
  }

  const waitForNewPostsAsync = async () => {
    await API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: newPost => {
        if (!didUserPost) {
          setDidUserPost(false);
          showPostsAsync(amountShown+1);
          setAmountShown(amountShown+1);
        }
      }
    });
    await API.graphql(graphqlOperation(onDeletePost)).subscribe({
      next: newPost => {
        if (!didUserPost) {
          setDidUserPost(false);
          showPostsAsync(amountShown);
        }
      }
    });
    await API.graphql(graphqlOperation(onUpdatePost)).subscribe({
      next: newPost => {
        if (!didUserPost) {
          setDidUserPost(false);
          showPostsAsync(amountShown);
        }
      }
    });
  }

  // This function now also has functionality for updating a post
  // We can separate updating functionality from adding functionality if it
  // becomes an issue later on.
  const addPostAsync = async () => {
    setDidUserPost(true);
    checkInternetConnection();
    if (updatePostID != 0) {
      //replace the post locally
      let tempposts = [...posts];
      tempposts[tempposts.findIndex(p => p.timestamp == updatePostID && p.userId == route.params?.id)].description = postDescription;
      setPosts(tempposts);

      try {
        await API.graphql(graphqlOperation(updatePost, { input: { timestamp: updatePostID, userId: route.params?.id, description: postDescription }}));
        console.log("success in updating a post");
      } catch (err) {
        console.log("error in updating post: ", err);
      }
      
      setPostDescription("");
      setUpdatePostID(0);
    }
    else {
      const newPost = {
        timestamp: Math.floor(Date.now()/1000),
        userId: route.params?.id,
        description: postDescription,
        group: group != null ? group.id : 'general',
      };
      setPostDescription("");
  
      setPosts([newPost, ...posts]);
      try {
        await API.graphql(graphqlOperation(createPost, { input: newPost }));
        setAmountShown(amountShown+1);
        console.log("success in making a new post, group is false? ", group == null);
      } catch (err) {
        console.log("error in creating post: ", err);
      }
      //console.log("current time...", );
    }
    
  };

  const deletePostsAsync = async (timestamp) => {
    setDidUserPost(true);
    checkInternetConnection();

    //locally removes the post
    setPosts((posts) => {
      return posts.filter((val) => (val.timestamp != timestamp && val.userId != route.params?.id));
    });

    //sends a request to remove the post from the server
    try {
      await API.graphql(graphqlOperation(deletePost, { input: { timestamp: timestamp, userId: route.params?.id } }));
    } catch {
      console.log("error in deleting post: ");
    }
  };

  return (
    <View style={styles.containerStyle}>
      <DisplayInternetConnection />
      <View style={{}}>
        <Text style = {{marginTop: 20, marginLeft: 5}}> Characters remaining: {numCharsLeft} </Text>
        <TextInput
          style={[styles.textInputStyle, { marginTop: 5, marginBottom: 30 }]}
          multiline={true}
          placeholder="Start Typing..."
          onChangeText={setPostDescription}
          value={postDescription}
          clearButtonMode="always"
          maxLength={1000}
        />
        

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 15,
        }}>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              postDescription != ""
                ? (addPostAsync(updatePostID))
                : alert("No text detected in text field");
            }}
          >
            <Text style={styles.buttonTextStyle}>{updatePostID == 0 ? 'Add Post' : 'Edit Post'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <RefreshableList
        queryFunction={postsByGroup}
        queryIdentifier={{group: group != null ? group.id : 'general'}}
        subscriptionFunction={waitForNewPostsAsync}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            deletePostsAsync={deletePostsAsync}
            writtenByYou={item.userId === route.params?.id}
            setPostDescription={setPostDescription}
            setUpdatePostID={setUpdatePostID}
          />
        )}
        keyExtractor={(item, index) => item.timestamp.toString() + item.userId}
      />

      <StatusBar style="auto" />
    </View>
  );
};