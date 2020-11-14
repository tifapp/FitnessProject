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
  Dimensions,
  RefreshControl,
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "root/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, Auth, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "root/src/graphql/mutations";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listPosts, postsByGroup } from "root/src/graphql/queries";
import PostItem from "components/PostItem";
import { onCreatePost, onDeletePost, onUpdatePost } from 'root/src/graphql/subscriptions';
import NetInfo from '@react-native-community/netinfo';

require('root/androidtimerfix');

Amplify.configure(awsconfig);

const { width } = Dimensions.get('window');

var styles = require('styles/stylesheet');

export default function GroupScreen({ navigation, route }) {
  
  const { group } = route.params;
  const [postVal, setPostVal] = useState("");
  const [posts, setPosts] = useState([]);
  const numCharsLeft = 1000 - postVal.length;
  const [updatePostID, setUpdatePostID] = useState(0);
  const [nextToken, setNextToken] = useState(null); //for pagination
  
  const isMounted = useRef(); //this variable exists to eliminate the "updated state on an unmounted component" warning
  const [onlineCheck, setOnlineCheck] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    showPostsAsync();
  }, []);

  useEffect(() => {
    isMounted.current = true;
    showPostsAsync();
    waitForNewPostsAsync();
    checkInternetConnection();
    return () => {isMounted.current = false;}
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
        showPostsAsync();
      }
    });
    await API.graphql(graphqlOperation(onDeletePost)).subscribe({
      next: newPost => {
        showPostsAsync();
      }
    });
    await API.graphql(graphqlOperation(onUpdatePost)).subscribe({
      next: newPost => {
        showPostsAsync();
      }
    });
  }

  const deleteButtonHandler = (key) => {
    setPosts((posts) => {
      return posts.filter((val) => val.id != key);
    });
  };

  // This function now also has functionality for updating a post
  // We can separate updating functionality from adding functionality if it
  // becomes an issue later on.
  const addPostAsync = async (val) => {
    checkInternetConnection();
    if (updatePostID != 0) {
      try {
        await API.graphql(graphqlOperation(updatePost, { input: { timestamp: updatePostID, userId: route.params?.id, description: postVal }}));
        showPostsAsync();
        console.log("success in updating a post");
      } catch (err) {
        console.log("error in updating post: ", err);
      }

      setPostVal("");
      setUpdatePostID(0)
    }
    else {
      const newPost = {
        timestamp: Math.floor(Date.now()/1000),
        userId: route.params?.id,
        description: postVal,
        group: group != null ? group.id : 'general',
      };
      setPostVal("");
  
      try {
        await API.graphql(graphqlOperation(createPost, { input: newPost }));
        showPostsAsync();
        console.log("success in making a new post, group is false? ", group == null);
      } catch (err) {
        console.log("error in creating post: ", err);
      }
      //console.log("current time...", );
    }
    
  };

  const showPostsAsync = async () => {
    try {
      const query = await API.graphql(graphqlOperation(postsByGroup, {limit: 10, nextToken: nextToken, group: group != null ? group.id : 'general', sortDirection: 'DESC'} ));
      console.log('showing these posts: ', query);

      if (isMounted.current) {
        setPosts(query.data.postsByGroup.items);
        setNextToken(query.data.postsByGroup.nextToken);
      }
    } catch (err) {
      console.log("error in displaying posts: ", err);
    }
    setRefreshing(false);
  };

  const deletePostsAsync = async (timestamp) => {
    checkInternetConnection();
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

      <FlatList
        data={posts}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        renderItem={({ item }) => (
          <PostItem
            item={item}
            pressHandler={deleteButtonHandler}
            deletePostsAsync={deletePostsAsync}
            writtenByYou={item.userId === route.params?.id}
            setPostVal={setPostVal}
            setUpdatePostID={setUpdatePostID}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      />


      <StatusBar style="auto" />
    </View>
  );
};