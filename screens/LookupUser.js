import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Button,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import { API, graphqlOperation } from "aws-amplify";
import { StackActions, NavigationActions } from "react-navigation";
import { ProfileImageAndName } from "components/ProfileImageAndName";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import computeDistance from "hooks/computeDistance";
import getLocation from "hooks/useLocation";
import printTime from "hooks/printTime";
import {
  getUser,
  getFriendRequest,
  getFriendship,
  listFriendships,
  friendsBySecondUser,
} from "../src/graphql/queries";
import {
  deleteFriendship,
  createFriendship,
  updateFriendship,
} from "root/src/graphql/mutations";
import {
  onCreateFriendship,
  onUpdateFriendship,
  onDeleteFriendship,
  onAllDeletedFriendships,
} from "root/src/graphql/subscriptions";
import APIList from "components/APIList";

var styles = require("styles/stylesheet");

const LookupUser = ({ route, navigation }) => {
  const [friendStatus, setFriendStatus] = useState("loading"); //can be either "received", "sent", "friends", or "none". don't misspell!
  const [friendsSince, setFriendsSince] = useState("");
  const [mutualfriendList, setMutualFriendList] = useState([]);

  //const [hifiveSent, setHifiveSent] = useState(false); //can be either "received", "sent", or "none". don't misspell!
  //const [hifives, setHifives] = useState(0);

  const { user } = route.params;
  const { userId } = route.params;

  let waitForFriend = "";
  let onUpdate = "";
  let onDelete = "";

  const checkUsersInfo = async () => {
    try {
      console.log("on the lookup screen, id is: ", userId);
      const u = await API.graphql(graphqlOperation(getUser, { id: userId }));
      console.log(u.data.getUser);
      if (u.data.getUser != null) {
        //console.log("this post is...", item.description, "and the author is...", user.data.getUser);
        navigation.setParams({ user: u.data.getUser });
      }

      //console.log("success, user is ", user);
    } catch (err) {
      console.log("error in finding user ", err);
    }
  };

  useEffect(() => {
    checkUsersInfo();
    checkFriendStatus();
    waitForFriendUpdateAsync();

    return () => {
      waitForFriend.unsubscribe();
      onUpdate.unsubscribe();
      onDelete.unsubscribe();
    };
  }, []);

  const collectMutualFriends = (items) => {
    //items is an array containing both user1 and user2's friendship objects
    //we must figure out where the duplicates are. by duplicates we mean userids that both users share.
    //why don't we just collect all the user id's that aren't user1 and user2 and pick out the duplicates?
    //maybe one iteration could work

    let ids = [];
    let mutuals = [];

    items.forEach((element) => {
      if (
        (element.sender == route.params?.myId || element.sender == userId) &&
        element.accepted
      ) {
        if (ids.includes(element.receiver)) mutuals.push(element.receiver);
        else ids.push(element.receiver);
      } else if (
        (element.receiver == route.params?.myId ||
          element.receiver == userId) &&
        element.accepted
      ) {
        if (ids.includes(element.sender)) mutuals.push(element.sender);
        else ids.push(element.sender);
      }
    });

    return mutuals;
  };

  const checkFriendStatus = async () => {
    console.log("CHECKING FRIEND STATUS");
    try {
      let friendship = await API.graphql(
        graphqlOperation(getFriendship, {
          sender: route.params?.myId,
          receiver: userId,
        })
      );

      if (friendship.data.getFriendship == null) {
        friendship = await API.graphql(
          graphqlOperation(getFriendship, {
            sender: userId,
            receiver: route.params?.myId,
          })
        );
      }

      // If two people are friends
      if (
        friendship.data.getFriendship != null &&
        friendship.data.getFriendship.accepted == true
      ) {
        setFriendStatus("friends");
        setFriendsSince(printTime(friendship.data.getFriendship.createdAt));
        //console.log("check");
      } else {
        console.log("YOU ARE NOT FRIENDS");
        setFriendsSince("");

        // Outgoing request
        if (
          friendship.data.getFriendship != null &&
          friendship.data.getFriendship.sender == route.params?.myId
        ) {
          setFriendStatus("sent");
        } else if (
          friendship.data.getFriendship != null &&
          friendship.data.getFriendship.receiver == route.params?.myId
        ) {
          setFriendStatus("received");
        } else {
          setFriendStatus("none");
        }
      }
      //waitForFriendUpdateAsync();
    } catch (err) {
      console.log(err);
    }
  };

  const waitForFriendUpdateAsync = async () => {
    // Case 1: Sender sends friend request to receiver. Update receiver's side to reject and accept buttons.
    waitForFriend = API.graphql(
      graphqlOperation(onCreateFriendship, {
        sender: userId,
        receiver: route.params?.myId,
      })
    ).subscribe({
      next: (event) => {
        const newFriendRequest = event.value.data.onCreateFriendship;
        //console.log(newFriendRequest);
        setFriendStatus("received");
      },
    });

    // Case 2: Receiver accepts friend request. Update the sender's side to delete button.
    onUpdate = API.graphql(
      graphqlOperation(onUpdateFriendship, {
        sender: route.params?.myId,
        receiver: userId,
      })
    ).subscribe({
      next: (event) => {
        const newFriend = event.value.data.onUpdateFriendship;
        //console.log(newFriend);
        if (newFriend.accepted) {
          setFriendStatus("friends");
        }
      },
    });

    // Case 3: Receiver rejects friend request. Update the sender's side to send button.
    // Case 4: Friendship is deleted by either sender or receiver. Update the other party's side to send button.
    onDelete = API.graphql(graphqlOperation(onAllDeletedFriendships)).subscribe(
      {
        next: (event) => {
          const exFriend = event.value.data.onAllDeletedFriendships;
          //console.log(exFriend);
          if (exFriend.sender == userId || exFriend.receiver == userId) {
            setFriendStatus("none");
          }
        },
      }
    );
  };

  const sendFriendRequest = async () => {
    setFriendStatus("sending");

    try {
      await API.graphql(
        graphqlOperation(createFriendship, { input: { receiver: user.id } })
      );
      console.log("success");
      setFriendStatus("sent"); //if received, should change to "friends". do a check before this
      alert("Sent successfully!");
    } catch (err) {
      console.log(err);
      alert("Could not be submitted!");
    }
  };

  const acceptFriendRequest = async () => {
    setFriendStatus("accepting");

    try {
      await API.graphql(
        graphqlOperation(updateFriendship, {
          input: { sender: user.id, accepted: true },
        })
      );
      console.log("success");
      setFriendStatus("friends");
      alert("Accepted successfully!");
    } catch (err) {
      console.log(err);
      alert("Could not be accepted");
    }
  };

  const unsendFriendRequest = async (temp) => {
    setFriendStatus("unsending");
    //console.log(temp);
    try {
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { sender: route.params?.myId, receiver: user.id },
        })
      );
      console.log("success");
      setFriendStatus("none");

      if (temp != true) {
        alert("Friend request unsent successfully!");
      }
    } catch (err) {
      console.log(err);
      console.log("error in deleting post: ");
    }
  };

  const rejectFriendRequest = async (temp) => {
    setFriendStatus("rejecting");

    try {
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { sender: user.id, receiver: route.params?.myId },
        })
      );
      console.log("success");
      setFriendStatus("none");

      if (temp != true) {
        alert("Friend request rejected successfully!");
      }
    } catch (err) {
      console.log(err);
      console.log("error in deleting post: ");
    }
  };

  const deleteFriend = async () => {
    setFriendStatus("deleting");

    try {
      let check = true;
      rejectFriendRequest(check);
      unsendFriendRequest(check);

      alert("Deleted Friend successfully!");
    } catch (err) {
      console.log(err);
      console.log("error in deleting post: ");
    }
  };

  return user == null ? null : (
    <View>
      <ScrollView>
        <View style={styles.border}>
          <View style={{ paddingBottom: 15 }}>
            <ProfileImageAndName
              you={userId === route.params?.myId}
              navigation={false}
              vertical={true}
              imageStyle={styles.imageStyle}
              userId={userId}
              isFull={true}
              fullname={true}
              callback={(info) => {
                navigation.setOptions({ title: info.name });
              }}
            />
          </View>

          <View>
            <View style={styles.viewProfileScreen}>
              <Text>Gender: {user.gender}</Text>
            </View>
            <View style={styles.viewProfileScreen}>
              <Text>Age: {user.age}</Text>
            </View>
          </View>
        </View>
        <View style={styles.viewProfileScreen}>
          <Text>Bio: </Text>
        </View>
        <Text style={styles.textBoxStyle}>{user.bio}</Text>
        <View style={styles.viewProfileScreen}>
          <Text>Goals: </Text>
        </View>

        <Text style={styles.textBoxStyle}>{user.goals}</Text>
        <View>
          {mutualfriendList.length != 0 ? (
            <View style={styles.viewProfileScreen}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Mutual Friends{" "}
              </Text>
            </View>
          ) : null}
        </View>
        <View>
          <SafeAreaView style={{ flex: 1 }}>
            <APIList
              initialAmount={10}
              additionalAmount={20}
              horizontal={true}
              queryOperation={listFriendships}
              data={mutualfriendList}
              setDataFunction={setMutualFriendList}
              processingFunction={collectMutualFriends}
              renderItem={({ item }) => (
                <View style={{ marginVertical: 5 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignSelf: "center",
                      marginVertical: 5,
                      justifyContent: "space-between",
                      width: "80%",
                    }}
                  >
                    <ProfileImageAndName
                      vertical={true}
                      imageStyle={[
                        styles.smallImageStyle,
                        { marginHorizontal: 20 },
                      ]}
                      userId={item}
                    />
                  </View>
                </View>
              )}
              keyExtractor={(item) => item}
            />
          </SafeAreaView>
        </View>
        {getLocation() != null && user.latitude != null ? (
          <View style={styles.viewProfileScreen}>
            <Text style={styles.viewProfileScreen}>
              {computeDistance([user.latitude, user.longitude])} mi. away
            </Text>
          </View>
        ) : null}
        {route.params?.myId != user.id ? (
          <View style={styles.buttonFormat}>
            {friendStatus == "loading" ? (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  flexDirection: "row",
                  justifyContent: "space-around",
                  padding: 10,
                }}
              />
            ) : friendStatus == "none" ? (
              <TouchableOpacity
                onPress={sendFriendRequest}
                style={styles.submitButton}
              >
                <Text style={styles.buttonTextStyle}>Send Friend Request</Text>
              </TouchableOpacity>
            ) : friendStatus == "sending" ? (
              <Text style={[styles.buttonTextStyle, { color: "red" }]}>
                Sending Friend Request...
              </Text>
            ) : friendStatus == "sent" ? (
              <TouchableOpacity
                onPress={unsendFriendRequest}
                style={styles.unsendButton}
              >
                <Text style={styles.buttonTextStyle}>
                  Unsend Friend Request
                </Text>
              </TouchableOpacity>
            ) : friendStatus == "unsending" ? (
              <Text style={[styles.buttonTextStyle, { color: "red" }]}>
                Unsending Friend Request...
              </Text>
            ) : friendStatus == "received" ? (
              <View>
                <TouchableOpacity
                  onPress={rejectFriendRequest}
                  style={styles.unsendButton}
                >
                  <Text style={styles.buttonTextStyle}>
                    Reject Friend Request
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={acceptFriendRequest}
                  style={styles.unsendButton}
                >
                  <Text style={styles.buttonTextStyle}>
                    Accept Friend Request
                  </Text>
                </TouchableOpacity>
              </View>
            ) : friendStatus == "rejecting" ? (
              <Text style={[styles.buttonTextStyle, { color: "red" }]}>
                Rejecting Friend Request...
              </Text>
            ) : friendStatus == "accepting" ? (
              <Text style={[styles.buttonTextStyle, { color: "red" }]}>
                Accepting Friend Request...
              </Text>
            ) : friendStatus == "deleting" ? (
              <Text style={[styles.buttonTextStyle, { color: "red" }]}>
                Unfriending...
              </Text>
            ) : (
              <View>
                <View style={styles.viewProfileScreen}>
                  <Text>Friends for {friendsSince} </Text>
                </View>
                <TouchableOpacity
                  onPress={deleteFriend}
                  style={styles.unsendButton}
                >
                  <Text style={styles.buttonTextStyle}>Unfriend</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default LookupUser;
