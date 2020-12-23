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
  RefreshControl,
  ActivityIndicator,
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "root/src/graphql/mutations";
import { listPosts, postsByGroup } from "root/src/graphql/queries";
import PostItem from "components/PostItem";
import { onCreatePost, onDeletePost, onUpdatePost } from 'root/src/graphql/subscriptions';
import NetInfo from '@react-native-community/netinfo';
import PaginatedList from 'components/PaginatedList';

require('root/androidtimerfix');

Amplify.configure(awsconfig);

var styles = require('styles/stylesheet');

const initialAmount = 10;
const additionalAmount = 5;

export default function FeedScreen({ navigation, route }) {
  const { group } = route.params;
  const [postVal, setPostVal] = useState("");
  const [posts, setPosts] = useState([]);
  const numCharsLeft = 1000 - postVal.length;
  const [updatePostID, setUpdatePostID] = useState(0);
  const [didUserPost, setDidUserPost] = useState(false);
  
  const [onlineCheck, setOnlineCheck] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    showPostsAsync();
  }, []);

  useEffect(() => {
    waitForNewPostsAsync();
    checkInternetConnection();
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
          showPostsAsync();
        } else {          
          setDidUserPost(false);
        }
      }
    });
    await API.graphql(graphqlOperation(onDeletePost)).subscribe({
      next: newPost => {
        if (!didUserPost) {
          //check if newpost is earlier than the earliest post in the array first.
          //if so, we won't even need to rerender anything
          //if not, loop through the posts array to find the one that matches newpost and replace it!
          //showPostsAsync();
        } else {          
          setDidUserPost(false);
        }
      }
    });
    await API.graphql(graphqlOperation(onUpdatePost)).subscribe({
      next: newPost => {
        if (!didUserPost) {
          //check if newpost is earlier than the earliest post in the array first.
          //if so, we won't even need to rerender anything
          //if not, loop through the posts array to find the one that matches newpost and replace it!
          //showPostsAsync();
        } else {          
          setDidUserPost(false);
        }
      }
    });
  }

  // This function now also has functionality for updating a post
  // We can separate updating functionality from adding functionality if it
  // becomes an issue later on.
  const addPostAsync = async (val) => {
    setDidUserPost(true);
    checkInternetConnection();
    if (updatePostID != 0) {
      //replace the post locally
      let tempposts = [...posts];
      tempposts[tempposts.findIndex(p => p.timestamp == updatePostID && p.userId == route.params?.id)].description = postVal;
      setPosts(tempposts);

      try {
        await API.graphql(graphqlOperation(updatePost, { input: { timestamp: updatePostID, userId: route.params?.id, description: postVal }}));
        console.log("success in updating a post");
      } catch (err) {
        console.log("error in updating post: ", err);
      }
      
      setPostVal("");
      setUpdatePostID(0);
    }
    else {
      const newPost = {
        timestamp: Math.floor(Date.now()/1000),
        userId: route.params?.id,
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

  const showPostsAsync = async (nextToken, setNextToken) => {
    //do not refetch if the user themselves added or updated a post
    //if new posts are being added don't refetch the entire batch, only append the new posts
    //if a post is being updated don't refetch the entire batch, only update that post
    //if a lot of new posts are being added dont save all of them, paginate them at like 100 posts
    try {
      const query = await API.graphql(graphqlOperation(postsByGroup, { limit: nextToken == null ? initialAmount : additionalAmount, nextToken: nextToken, group: group != null ? group.id : 'general', sortDirection: 'DESC' }));
      //console.log('showing these posts: ', query);

      setPosts([...posts, ...query.data.postsByGroup.items]);
      if (setNextToken != null) {
        setNextToken(query.data.postsByGroup.nextToken);
      }
    } catch (err) {
      console.log("error in displaying posts: ", err);
    }
    setRefreshing(false);
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
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              postVal != ""
                ? (addPostAsync(updatePostID))
                : alert("No text detected in text field");
            }}
          >
            <Text style={styles.buttonTextStyle}>{updatePostID == 0 ? 'Add Post' : 'Edit Post'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <PaginatedList
        showDataFunction={showPostsAsync}
        data={posts}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        renderItem={({ item }) => (
          <PostItem
            item={item}
            deletePostsAsync={deletePostsAsync}
            writtenByYou={item.userId === route.params?.id}
            setPostVal={setPostVal}
            setUpdatePostID={setUpdatePostID}
          />
        )}
        keyExtractor={(item, index) => item.timestamp.toString() + item.userId}
      />

      <StatusBar style="auto" />
    </View>
  );
};