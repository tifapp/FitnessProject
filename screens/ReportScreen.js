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
  
  const deletePost = async (report, ignore) => {
    const ids = report.postId.split("#");
    const createdAt = ids[0];
    const userId = ids[1];

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setReports((reports) => {
      return reports.filter((report) => (report.post.createdAt !== createdAt || report.post.userId !== userId));
    });

    try {
      if (!ignore) API.graphql(graphqlOperation(deletePost, { input: { createdAt: createdAt, userId: userId } }));
      API.graphql(graphqlOperation(deleteReport, { input: { createdAt: report.createdAt, postId: report.postId } }));
    } catch {
      console.log("error in deleting post: ");
    }
  };

  const attachPosts = async (newReports) => {
    console.log(newReports);

    const posts = await allSettled(newReports.map((report) => {
      const ids = report.postId.split("#");
      const createdAt = ids[0];
      const userId = ids[1];
      return API.graphql(graphqlOperation(getPost, { createdAt: createdAt, userId: userId }))
    }
    ));

    newReports.forEach((report, index) => {
      report.post = posts[index]; //amplify connection would probably be good here
    });

    return newReports; //what if there are duplicates?
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
              onPress={() => deletePost(item, false)}
            >
              <Text>
                Delete post.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deletePost(item, true)}
            >
              <Text>
                Ignore.
              </Text>
            </TouchableOpacity>
          </View>
        )}
        processingFunction={attachPosts}
        keyExtractor={(item) => item.userId + item.createdAt}
      />
    </SafeAreaView>
  );
};