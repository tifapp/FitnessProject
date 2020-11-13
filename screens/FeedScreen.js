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
import { listPosts } from "root/src/graphql/queries";
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
  const [updatePostID, setUpdatePostID] = useState('');
  
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
    if (updatePostID != '') {
      try {
        await API.graphql(graphqlOperation(updatePost, { input: { userId: route.params?.id, group: group != null ? group.id : '', description: postVal }}));
        showPostsAsync();
        console.log("success in updating a post");
      } catch (err) {
        console.log("error: ", err);
      }

      setPostVal("");
      setUpdatePostID('')
    }
    else {
      const newPost = {
        userId: route.params?.id,
        description: postVal,
        group: group != null ? group.id : '',
      };
      setPostVal("");
  
      try {
        await API.graphql(graphqlOperation(createPost, { input: newPost }));
        showPostsAsync();
        console.log("success in making a new post");
      } catch (err) {
        console.log("error: ", err);
      }
      //console.log("current time...", );
    }
    
  };

  const showPostsAsync = async () => {
    try {
      const query = await API.graphql(graphqlOperation(listPosts,
        {
            filter: {
              group: {
                eq: group != null ? group.id : '',
              }
            }
        }
        ));
      let val = query.data.listPosts.items;

      if (isMounted.current)
        setPosts(val);
    } catch (err) {
      console.log("error: ", err);
    }
    setRefreshing(false);
  };

  const deletePostsAsync = async (val) => {
    checkInternetConnection();
    try {
      await API.graphql(graphqlOperation(deletePost, { input: { id: val } }));
    } catch {
      console.log("error: ");
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
            <Text style={styles.buttonTextStyle}>{updatePostID == '' ? 'Add Post' : 'Edit Post'}</Text>
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
      />


      <StatusBar style="auto" />
    </View>
  );
};