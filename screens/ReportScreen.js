import React, { useState, useEffect, useRef, } from "react";
import {
  Text,
  View,
  SafeAreaView,
  LayoutAnimation,
} from "react-native";
// Get the aws resources configuration parameters
import { API, graphqlOperation, Cache } from "aws-amplify";
import { listReports, getPost } from "root/src/graphql/queries";
import { onCreateLikeForPost, onDeleteLikeForPost, } from 'root/src/graphql/subscriptions';
import { ProfileImageAndName } from "components/ProfileImageAndName";
import printTime from "hooks/printTime";
import APIList from 'components/APIList';

var styles = require('styles/stylesheet');

var allSettled = require('promise.allsettled');

export default function ReportScreen() {
  const [reports, setReports] = useState([]);
  
  const deletePost = async (timestamp, userId) => {
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

  const attachPosts = async (newReports) => {
    /*
    const posts = await allSettled(newReports.map((report) => API.graphql(graphqlOperation(getPost, { createdAt: report.createdAt, userId: report.userId }))));

    return posts;
    */
   
    return newReports;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APIList
        initialAmount={10}
        additionalAmount={20}
        queryOperation={listReports}
        data={reports}
        setDataFunction={setReports}
        renderItem={({ item }) => (
          <View>
          <Text>
            this is a report!
          </Text>
          
          <TouchableOpacity
            >
            </TouchableOpacity>
          </View>
        )}
        processingFunction={attachPosts}
        keyExtractor={(item) => item.userId}
      />
    </SafeAreaView>
  );
};