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
} from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import awsconfig from "./aws-exports"; // if you are using Amplify CLI
import { Amplify, API, Auth, graphqlOperation } from "aws-amplify";
import { createPost, updatePost, deletePost } from "./src/graphql/mutations";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { listPosts } from "./src/graphql/queries";
import Header from "./components/header";
import AddPost from "./components/AddPosts";
import DeleteItem from "./components/deletePosts";

Amplify.configure(awsconfig);

const App = () => {
  const [postVal, setPostVal] = useState("");
  const [posts, setPosts] = useState([]);
  const [emailVal, setEmailVal] = useState("");

  useEffect(() => {
    showPostsAsync(), addingEmail();
  }, []);

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

  async function signOut() {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log("error");
    }
  }

  const addPostAsync = async () => {
    var yearVal = new Date().getFullYear();
    var monthVal = new Date().getMonth();
    var dayVal = new Date().getDate();
    var hourVal = new Date().getHours();
    var minuteVal = new Date().getMinutes();
    let timeCheck = "AM";

    if (hourVal >= 12 && hourVal <= 23) {
      timeCheck = "PM";
    }

    if (hourVal == 0) {
      hourVal = hourVal + 12;
    }

    if (hourVal > 12) {
      hourVal = hourVal - 12;
    }

    const newUser = {
      id: Date.now(),
      name: postVal,
      email: emailVal,
      year: yearVal,
      month: monthVal,
      day: dayVal,
      hour: hourVal,
      minute: minuteVal,
      timeOfDay: timeCheck,
    };
    setPostVal("");

    try {
      await API.graphql(graphqlOperation(createPost, { input: newUser }));
      console.log("success");
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const showPostsAsync = async () => {
    try {
      const query = await API.graphql(graphqlOperation(listPosts));
      let val = query.data.listPosts.items;

      val.sort((a, b) => {
        return b.id - a.id;
      });
      setPosts(val);
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const deletePostsAsync = async (val) => {
    try {
      await API.graphql(graphqlOperation(deletePost, { input: { id: val } }));
    } catch {
      console.log("error: ");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistsTaps="handled"
    >
      <View>
        <View style={styles.signOutTop}>
          <TouchableOpacity style={styles.top} color="red" onPress={signOut}>
            <Text style={styles.signOutVal}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Header />
        <TextInput
          style={styles.input}
          multiline={true}
          placeholder="Start Typing ..."
          onChangeText={setPostVal}
          value={postVal}
          clearButtonMode="always"
        />
        <View style={styles.spaceAround}>
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => {
              postVal != ""
                ? (addingEmail(), addPostAsync(), showPostsAsync())
                : alert("No text detected in text field");
            }}
          >
            <View>
              <Text style={styles.val}>Add Post</Text>
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <DeleteItem
              item={item}
              pressHandler={pressHandler}
              deletePostsAsync={deletePostsAsync}
              emailVal={emailVal}
            />
          )}
        />

        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
};

export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    fontSize: 30,
  },
  stretch: {
    flex: 1,
  },
  button: {
    alignItems: "center",
    padding: 25,
    marginTop: 16,
    borderColor: "#bbb",
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#ffa500",
  },
  val: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  signOutVal: {
    fontWeight: "bold",
  },
  spaceAround: {
    paddingHorizontal: 125,
  },
  top: {
    alignItems: "center",
    marginTop: 30,
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#ADD8E6",
  },
  signOutTop: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 25,
    paddingVertical: 25,
  },
  postButton: {
    alignItems: "center",
    marginTop: 30,
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#ffa500",
  },
});
