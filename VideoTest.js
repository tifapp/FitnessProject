import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Button,
  Image,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  Alert
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "./aws-exports"; // if you are using Amplify CLI
import { Amplify, API, Auth, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "./src/graphql/mutations";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listPosts } from "./src/graphql/queries";
import Header from "./components/header";
import AddPost from "./components/AddPosts";
import PostItem from "./components/PostItem";
import * as subscriptions from './src/graphql/subscriptions';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';

Amplify.configure(awsconfig);

var styles = require('./styles/stylesheet');

export default function VideoTest() {
  const [imageURL, setImageURL] = useState('');

  const promptUser = () => {
    const title = 'Select a profile pic!';
    const options = [
      { text: 'Take a pic', onPress: () => pickFromCamera(setImageURL) },
      { text: 'Select a pic from photos', onPress: () => pickFromGallery(setImageURL) },
      {
        text: 'Remove pic', onPress: () => {
          setImageURL('');
        }
      },
      { text: 'Cancel', type: 'cancel', },
    ];
    Alert.alert(title, '', options, { cancelable: true });
  }

  const pressHandler = (key) => {
    setPosts((posts) => {
      return posts.filter((val) => val.id != key);
    });
  };

  const addingEmail = async () => {
    try {
      let info = await Auth.currentUserInfo();
      setEmailVal(info.attributes.email);
    } catch {
      console.log("error");
    }
  };

  const addPostAsync = async () => {
    const newUser = {
      timestamp: Math.floor(Date.now() / 1000),
      name: postVal,
      email: emailVal,
    };

    setPostVal("");

    try {
      await API.graphql(graphqlOperation(createPost, { input: newUser }));
      showPostsAsync();
      console.log("success");
    } catch (err) {
      console.log("error: ", err);
    }
    //console.log("current time..", );
  };

  const showPostsAsync = async () => {
    try {
      const query = await API.graphql(graphqlOperation(listPosts));
      let val = query.data.listPosts.items;

      val.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
      setPosts(val);
      addingEmail();
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const pickFromGallery = async (setImageURL) => {
    const { granted } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
    if (granted) {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1
      })
      if (!response.cancelled) {
        setImageURL(response.uri)
      }

      console.log(response)
    }
    else {
      Alert.alert('Photos access denied!')
    }

  }

  const pickFromCamera = async (setImageURL) => {
    const { granted } = await Permissions.askAsync(Permissions.CAMERA)
    if (granted) {
      let response = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1
      })
      if (!response.cancelled) {
        setImageURL(response.uri)
      }

      console.log(response)
    }
    else {
      Alert.alert('Camera access denied!')
    }
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => promptUser()}
      >
        <Image
          style={styles.imageStyle}
          source={require('./assets/icon.png')}
        />
      </TouchableOpacity>
    </View>
  );
};