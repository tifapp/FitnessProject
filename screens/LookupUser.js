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
import IconButton from "components/IconButton";
import {
  getUser,
  getFriendRequest,
  getFriendship,
  listFriendships,
  friendsBySecondUser,
  getBlock
} from "../src/graphql/queries";
import {
  deleteFriendship,
  createFriendship,
  updateFriendship,
  deleteBlock,
  createBlock
} from "root/src/graphql/mutations";
import {
  onCreateFriendship,
  onUpdateFriendship,
  onDeleteFriendship,
} from "root/src/graphql/subscriptions";
import APIList from "components/APIList";
import { saveCapitals, loadCapitals } from 'hooks/stringConversion';
import StatusIndicator from 'components/StatusIndicator';

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
  let onDelete2 = "";

  const addConversation = (id) => {
    /*
    if (!navigation.push)
      navigation.navigate(id);
    else navigation.push(id);
    */

    /*
     if(friendStatus == "friends"){
      navigation.navigate(id);
     }
     else{
      global.addConversationIds(id);
      navigation.navigate(id);
     }
    */
    //console(id);
    //console("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    global.addConversationIds(id);
  };

  const checkUsersInfo = async () => {
    try {
      //console("on the lookup screen, id is: ", userId);
      const u = await API.graphql(graphqlOperation(getUser, { id: userId }));
      //console(u.data.getUser);
      if (u.data.getUser != null) {
        ////console("this post is...", item.description, "and the author is...", user.data.getUser);
        navigation.setParams({ user: u.data.getUser });
        console.log(u.data.getUser);
      }

      ////console("success, user is ", user);
    } catch (err) {
      //console("error in finding user ", err);
    }
  };

  useEffect(() => {
    checkUsersInfo();
    checkFriendStatus();
    waitForFriendUpdateAsync();
    addConversation(userId);

    return () => {
      if (waitForFriend) waitForFriend.unsubscribe();
      if (onUpdate) onUpdate.unsubscribe();
      if (onDelete) onDelete.unsubscribe();
      if (onDelete2) onDelete2.unsubscribe();
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
    console.log("Checking Friend Status");

    try {
      let blocked = await API.graphql(
        graphqlOperation(getBlock, {
          userId: userId,
          blockee: route.params?.myId,
        })
      );

      if (blocked.data.getBlock != null) { setFriendStatus("blocked"); console.log("You are blocked by this user"); return; }

      let blocker = await API.graphql(
        graphqlOperation(getBlock, {
          userId: route.params?.myId,
          blockee: userId,
        })
      );

      if (blocker.data.getBlock != null) { setFriendStatus("blocker"); return; }

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
        ////console("check");
      } else {
        //console("YOU ARE NOT FRIENDS");
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
      //console(err);
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
        ////console(newFriendRequest);
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
        ////console(newFriend);
        if (newFriend.accepted) {
          setFriendStatus("friends");
        }
      },
    });

    // Case 3: Receiver rejects friend request. Update the sender's side to send button.
    // Case 4: Friendship is deleted by either sender or receiver. Update the other party's side to send button.
    onDelete = API.graphql(graphqlOperation(onDeleteFriendship, {
      sender: route.params?.myId,
      receiver: userId,
    })).subscribe(
      {
        next: (event) => {
          const exFriend = event.value.data.onDeleteFriendship;
          ////console(exFriend);
          if (exFriend.sender == userId || exFriend.receiver == userId) {
            setFriendStatus("none");
          }
        },
      }
    )

    onDelete2 = API.graphql(graphqlOperation(onDeleteFriendship, {
      sender: userId,
      receiver: route.params?.myId,
    })).subscribe(
      {
        next: (event) => {
          const exFriend = event.value.data.onDeleteFriendship;
          ////console(exFriend);
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
      //console("success");
      setFriendStatus("sent"); //if received, should change to "friends". do a check before this
      alert("Sent successfully!");
    } catch (err) {
      //console(err);
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
      //console("success");
      setFriendStatus("friends");
      alert("Accepted successfully!");
    } catch (err) {
      //console(err);
      alert("Could not be accepted");
    }
  };

  const unsendFriendRequest = async (temp) => {
    if (!temp)
      setFriendStatus("unsending");
    ////console(temp);
    try {
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { sender: route.params?.myId, receiver: user.id },
        })
      );
      //console("success");

      if (temp != true) {
        setFriendStatus("none");
        alert("Friend request unsent successfully!");
      }
    } catch (err) {
      //console(err);
      //console("error in unsending request: ");
    }
  };

  const rejectFriendRequest = async (temp) => {
    if (!temp)
      setFriendStatus("rejecting");

    try {
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { sender: user.id, receiver: route.params?.myId },
        })
      );
      //console("success");

      if (temp != true) {
        setFriendStatus("none");
        alert("Friend request rejected successfully!");
      }
    } catch (err) {
      //console(err);
      //console("error in rejecting friend: ");
    }
  };

  const deleteFriend = async (temp) => {
    if (!temp)
      setFriendStatus("deleting");

    try {
      let check = true;
      rejectFriendRequest(check);
      unsendFriendRequest(check);
      if (!temp)
        setFriendStatus("none");

      alert("Deleted Friend successfully!");
    } catch (err) {
      //console(err);
      //console("error in deleting friend: ");
    }
  };

  const unblockUser = async () => {
    try {
      API.graphql(
        graphqlOperation(deleteBlock, { input: { userId: route.params?.myId, blockee: userId } })
      );
      global.localBlockList = global.localBlockList.filter(i => i.blockee !== userId);
      //console(global.localBlockList);
      setFriendStatus("none");
    } catch (err) {
      //console(err);
      //console("error when unblocking");
    }
  }

  const blockUser = async () => {
    try {
      deleteFriend(true);
      API.graphql(
        graphqlOperation(createBlock, { input: { blockee: userId } })
      );
      global.localBlockList.push({ createdAt: (new Date(Date.now())).toISOString(), userId: route.params?.myId, blockee: userId });
      //console(global.localBlockList);
      setFriendStatus("blocker");
    } catch (err) {
      //console(err);
      //console("error when unblocking");
    }
  }
  
  const alertOptions = {
    cancelable: true,
  };
  
  const openOptionsDialog = () => {
    const title = "More Options";
    const message = "";
    const options = [
      {
        text: "Block",
        onPress: () => {
          const title = "Are you sure you want to block this friend? This will unfriend them and delete all messages.";
          const options = [
            {
              text: "Yes",
              onPress: blockUser,
            },
            {
              text: "Cancel",
              type: "cancel",
            },
          ];
          Alert.alert(title, "", options, alertOptions);
        },
      },
      {
        text: "Cancel",
        type: "cancel",
      },
    ];
    Alert.alert(title, message, options, alertOptions);
  }

  return user == null ? null : (
    <ScrollView>
      <View style={{}}>
        <View style={{ flex: 1 }}>
          <ProfileImageAndName
            onPress={(imageURL) => { navigation.navigate("Image", { uri: imageURL });
            }}
            style={{ margin: 20 }}
            imageSize={Dimensions.get('window').width / 2 - 30}
            textStyle={{ fontWeight: "bold", fontSize: 24 }}
            textLayoutStyle={{ flex: 1 }}
            userId={userId}
            isFullSize={true}
            callback={(info) => {
              navigation.setOptions({ title: info.name });
            }}
            nameComponent={
              <View><Text style={{marginTop: 6, fontSize: 16}}>{`(${user.age}, ${user.gender})`}</Text></View>
            }
            spaceAfterName={true}
            subtitleComponent={
              <StatusIndicator status={user.status} />
            }
          />
        </View>
      </View>
      
      {
        user.bio ?
          <View style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            marginBottom: 20,
            marginHorizontal: 20,

            elevation: 1,
            padding: 15,
            flex: 0
          }}>
            <Text style={{ fontSize: 18, color: "gray", marginBottom: 5 }}>Biography</Text>

            <Text style={{ fontSize: 18, color: "black" }}>{loadCapitals(user.bio)}</Text>
          </View>
          : null
      }

      {
        user.goals ?
          <View style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            marginBottom: 20,
            marginHorizontal: 20,

            elevation: 1,
            padding: 15,
            flex: 0
          }}>
            <Text style={{ fontSize: 18, color: "gray", marginBottom: 5 }}>Goals</Text>

            <Text style={{ fontSize: 18, color: "black" }}>{loadCapitals(user.goals)}</Text>
          </View>
          : null
      }
      
      {
        !(friendStatus == "blocker" || friendStatus == "blocked") && route.params?.myId != user.id ?
          <View style={{ alignItems: "stretch", flexDirection: "column", marginHorizontal: 20, marginTop: 5, }}>
            {(!user.friendRequestPrivacy || user.friendRequestPrivacy === 0 || (mutualfriendList.length > 0 && user.friendRequestPrivacy === 1) || (friendStatus === "friends" && user.friendRequestPrivacy >= 1)) ?
              friendStatus === "none" ?
                <IconButton
                  style={{flex: 1, borderColor: "blue", borderWidth: 1, padding: 15, marginLeft: 10, justifyContent: "center"}}
                  iconName={"person-add"}
                  size={24}
                  fontWeight={"bold"}
                  fontSize={20}
                  color={"blue"}
                  onPress={sendFriendRequest}
                  label={"Add Friend"}
                />
                : friendStatus === "sending" ?
                  <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 2, alignSelf: "center" }}>
                    Sending Request...
                  </Text>
                  : friendStatus === "sent" ?
                    <IconButton
                    style={{flex: 1, borderColor: "red", borderWidth: 1, padding: 15, paddingVertical: 5, marginLeft: 10, justifyContent: "center"}}
                      iconName={"person-remove"}
                      size={24}
                      fontWeight={"bold"}
                      fontSize={18}
                      color={"red"}
                      onPress={unsendFriendRequest}
                      label={"Unsend Request"}
                    />
                    : friendStatus === "unsending" ?
                      <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 2, alignSelf: "center" }}>
                        Unsending Request...
                      </Text>
                      : friendStatus == "received" ? (
                        <View style={{ alignItems: "flex-start" }}>
                          <IconButton
                    style={{flex: 1, borderColor: "green", borderWidth: 1, padding: 15, paddingVertical: 5, marginLeft: 10, justifyContent: "center"}}
                            iconName={"person-add"}
                            size={24}
                            fontWeight={"bold"}
                            fontSize={20}
                            color={"green"}
                            onPress={acceptFriendRequest}
                            label={"Accept Request"}
                          />
                          <IconButton
                    style={{flex: 1, borderColor: "red", borderWidth: 1, padding: 15, paddingVertical: 5, marginLeft: 10, justifyContent: "center"}}
                            iconName={"person-remove"}
                            size={24}
                            fontWeight={"bold"}
                            fontSize={20}
                            color={"red"}
                            onPress={rejectFriendRequest}
                            label={"Reject Request"}
                          />
                        </View>
                      )
                        : friendStatus === "rejecting" ? (
                          <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 2 }}>
                            Rejecting Request...
                          </Text>
                        ) : friendStatus === "accepting" ? (
                          <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 2 }}>
                            Accepting Request...
                          </Text>
                        ) : friendStatus === "deleting" ? (
                          <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 2 }}>
                            Removing Friend...
                          </Text>
                        ) : friendStatus === "friends" ? (
                          <View>
                            <View style={[styles.viewProfileScreen, {fontSize: 20, fontWeight: "bold",}]}>
                              <Text>Friends for {friendsSince} </Text>
                            </View>
                            <IconButton
                              iconName={"person-remove"}
                              size={20}
                              fontWeight={"normal"}
                              fontSize={18}
                              color={"red"}
                              onPress={deleteFriend}
                              label={"Unfriend"}
                            />
                          </View>
                        )
                          : null
              : null
            }
            {(!user.messagesPrivacy || user.messagesPrivacy === 0 || (mutualfriendList.length > 0 && user.messagesPrivacy === 1) || (friendStatus === "friends" && user.messagesPrivacy >= 1)) ?
              <IconButton
                style={{flex: 1, borderColor: "blue", borderWidth: 1, padding: 15, marginHorizontal: 10, justifyContent: "center"}}
                iconName={"message"}
                size={24}
                fontSize={20}
                color={"blue"}
                onPress={() => {
                  navigation.navigate(userId);
                }}
                fontWeight={"bold"}
                label={"Message"}
              />
              : null}
            <IconButton
                iconName={"more-vert"}
                size={24}
                fontSize={20}
                color={"black"}
                onPress={openOptionsDialog}
                fontWeight={"bold"}
              />
          </View> : null
      }

      <View>
        {mutualfriendList.length != 0 ? (
          <View style={styles.viewProfileScreen}>
            <Text style={{ fontSize: 20, fontWeight: "normal", marginTop: 30 }}>
              Mutual Friends{" "}
            </Text>
          </View>
        ) : null}
      </View>
      <View>
          <APIList
            initialAmount={10}
            additionalAmount={20}
            horizontal={true}
            queryOperation={listFriendships}
            data={mutualfriendList}
            setDataFunction={setMutualFriendList}
            processingFunction={collectMutualFriends}
            renderItem={({ item }) => (
              <ProfileImageAndName
                style={{ marginHorizontal: 20 }}
                vertical={true}
                userId={item}
              />
            )}
            keyExtractor={(item) => item}
          />
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
              color="#26c6a2"
              style={{
                flex: 1,
                justifyContent: "center",
                flexDirection: "row",
                justifyContent: "space-around",
                padding: 10,
              }}
            />
          ) : friendStatus == "blocked" ? null
            : friendStatus == "blocker" ? (
              <TouchableOpacity
                onPress={unblockUser}
                style={{borderColor: "black", borderWidth: 1, padding: 15, alignItems: "center", margin: 20}}
              >
                <Text style={{color: "black", fontWeight: "bold", fontSize: 20}}>Unblock</Text>
              </TouchableOpacity>) : null}
        </View>
      ) : null}
    </ScrollView>
  );
};

export default LookupUser;
