import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  SafeAreaView,
  LayoutAnimation,
  TouchableOpacity,
} from "react-native";
// Get the aws resources configuration parameters
import { API, graphqlOperation, Cache, Auth } from "aws-amplify";
import { listReports, getPost } from "root/src/graphql/queries";
import { deletePost, deleteReport } from "root/src/graphql/mutations";
import { ProfileImageAndName } from "components/ProfileImageAndName";
import printTime from "hooks/printTime";
import APIList from "components/APIList";
import PostItem from "components/PostItem";

var styles = require("styles/stylesheet");

var allSettled = require("promise.allsettled");

export default function ReportScreen() {
  const [reports, setReports] = useState([]);

  const deletePostAndReport = async (report, ignore) => {
    if (!report.post) return;
    const ids = report.postId.split("#");
    const createdAt = ids[0];
    const userId = ids[1];

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setReports((reports) => {
      return reports.filter((report) => {
        if (report.post)
          return (
            report.post.createdAt !== createdAt || report.post.userId !== userId
          );
      });
    });

    try {
      if (!ignore) {
        API.graphql(
          graphqlOperation(deletePost, {
            input: { createdAt: createdAt, userId: userId },
          })
        );
      }
      API.graphql(
        graphqlOperation(deleteReport, {
          input: { createdAt: report.createdAt, postId: report.postId },
        })
      );
    } catch (err) {
      console.log("error in deleting post: ", err);
    }
  };

  const attachPosts = async (newReports) => {
    console.log(newReports);

    const posts = await allSettled(
      newReports.map((report) => {
        const ids = report.postId.split("#");
        const createdAt = ids[0];
        const userId = ids[1];
        return API.graphql(
          graphqlOperation(getPost, { createdAt: createdAt, userId: userId })
        );
      })
    );

    console.log(posts);

    newReports.forEach((report, index) => {
      report.post = posts[index].value.data.getPost; //amplify connection would probably be good here
    });

    return newReports; //what if there are duplicates?
  };

  async function signOut() {
    Auth.signOut();
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APIList
        initialAmount={10}
        additionalAmount={20}
        queryOperation={listReports}
        data={reports}
        setDataFunction={setReports}
        ListHeaderComponent={
          <TouchableOpacity onPress={signOut}>
            <Text>Log out</Text>
          </TouchableOpacity>
        }
        renderItem={({ item, index }) => (
          <View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <TouchableOpacity
                onPress={() => deletePostAndReport(item, false)}
              >
                <Text>Delete post.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deletePostAndReport(item, true)}>
                <Text>Ignore.</Text>
              </TouchableOpacity>
            </View>
            {item.post ? <PostItem index={index} item={item.post} /> : null}
          </View>
        )}
        processingFunction={attachPosts}
        keyExtractor={(item) => item.userId + item.createdAt}
      />
    </SafeAreaView>
  );
}
