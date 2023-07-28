import API, { GraphQLQuery, GraphQLSubscription } from "@aws-amplify/api"
import APIList, { APIListRefType } from "@components/APIList"
import IconButton from "@components/common/IconButton"
import { ProfileImageAndName } from "@components/ProfileImageAndName"
import StatusIndicator from "@components/StatusIndicator"
import {
  createBlock,
  createFriendship,
  deleteBlock,
  deleteFriendship,
  updateFriendship
} from "@graphql/mutations"
import {
  getBlock,
  getFriendship,
  getUser,
  listFriendships
} from "@graphql/queries"
import {
  // onCreateFriendship,
  onDeleteFriendship
} from "@graphql/subscriptions"
import computeDistance from "@hooks/computeDistance"
import printTime from "@hooks/printTime"
import { loadCapitals } from "@hooks/stringConversion"
import { useNavigation, useRoute } from "@react-navigation/native"
import { LookupScreenRouteProps } from "@stacks/MainStack"
import { graphqlOperation } from "aws-amplify"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { Friendship, User } from "src/models"

type FriendStatus = "loading" | "received" | "sent" | "friends" | "none" | "blocked" | "blocker" | "sending" | "accepting" | "unsending" | "rejecting" | "deleting";

const LookupUser = () => {
  const [areMutualFriends, setAreMutualFriends] = useState()
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("loading") // can be either "received", "sent", "friends", or "none". don't misspell!
  const [friendsSince, setFriendsSince] = useState("")
  const [user, setUser] = useState<User>()
  const listRef = useRef<APIListRefType<Friendship>>(null)

  const navigation = useNavigation()

  // const [hifiveSent, setHifiveSent] = useState(false); //can be either "received", "sent", or "none". don't misspell!
  // const [hifives, setHifives] = useState(0);

  const { params: { userId } } = useRoute<LookupScreenRouteProps>()

  // just get the whole user here via graphql query instead of passing the user as an object every time.
  // the profileimageandname component as well as search screen can use a smaller version of the query that only picks out the name and image and status
  // maybe this screen can grab the remaining fields. but would be a bit complicated

  let waitForFriend = ""
  let onUpdate = ""
  let onDelete = ""
  let onDelete2 = ""

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
    // console(id);
    // console("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    global.addConversationIds(id)
  }

  const checkUsersInfo = async () => {
    try {
      // console("on the lookup screen, id is: ", userId);
      const u = await API.graphql<GraphQLQuery<{getUser: User}>>(graphqlOperation(getUser, { id: userId }))
      // console(u.data.getUser);
      setUser(u.data?.getUser)

      /// /console("success, user is ", user);
    } catch (err) {
      // console("error in finding user ", err);
    }
  }

  useEffect(() => {
    checkUsersInfo()
    checkFriendStatus()
    waitForFriendUpdateAsync()
    addConversation(userId)

    return () => {
      if (waitForFriend) waitForFriend.unsubscribe()
      if (onUpdate) onUpdate.unsubscribe()
      if (onDelete) onDelete.unsubscribe()
      if (onDelete2) onDelete2.unsubscribe()
    }
  }, [])

  const collectMutualFriends = (items) => {
    // items is an array containing both user1 and user2's friendship objects
    // we must figure out where the duplicates are. by duplicates we mean userids that both users share.
    // why don't we just collect all the user id's that aren't user1 and user2 and pick out the duplicates?
    // maybe one iteration could work

    const ids = []
    const mutuals = []

    items.forEach((element) => {
      if (
        (element.sender == globalThis.myId || element.sender == userId) &&
        element.accepted
      ) {
        if (ids.includes(element.receiver)) mutuals.push(element.receiver)
        else ids.push(element.receiver)
      } else if (
        (element.receiver == globalThis.myId ||
          element.receiver == userId) &&
        element.accepted
      ) {
        if (ids.includes(element.sender)) mutuals.push(element.sender)
        else ids.push(element.sender)
      }
    })

    if (mutuals.length > 0) setAreMutualFriends(true)

    return mutuals
  }

  const checkFriendStatus = async () => {
    console.log("Checking Friend Status")

    try {
      const blocked = await API.graphql(
        graphqlOperation(getBlock, {
          userId,
          blockee: globalThis.myId
        })
      )

      if (blocked.data.getBlock != null) {
        setFriendStatus("blocked")
        console.log("You are blocked by this user")
        return
      }

      const blocker = await API.graphql(
        graphqlOperation(getBlock, {
          userId: globalThis.myId,
          blockee: userId
        })
      )

      if (blocker.data.getBlock != null) {
        setFriendStatus("blocker")
        return
      }

      let friendship = await API.graphql(
        graphqlOperation(getFriendship, {
          sender: globalThis.myId,
          receiver: userId
        })
      )

      if (friendship.data.getFriendship == null) {
        friendship = await API.graphql(
          graphqlOperation(getFriendship, {
            sender: userId,
            receiver: globalThis.myId
          })
        )
      }

      // If two people are friends
      if (
        friendship.data.getFriendship != null &&
        friendship.data.getFriendship.accepted == true
      ) {
        setFriendStatus("friends")
        setFriendsSince(printTime(friendship.data.getFriendship.createdAt))
        /// /console("check");
      } else {
        // console("YOU ARE NOT FRIENDS");
        setFriendsSince("")

        // Outgoing request
        if (
          friendship.data.getFriendship != null &&
          friendship.data.getFriendship.sender == globalThis.myId
        ) {
          setFriendStatus("sent")
        } else if (
          friendship.data.getFriendship != null &&
          friendship.data.getFriendship.receiver == globalThis.myId
        ) {
          setFriendStatus("received")
        } else {
          setFriendStatus("none")
        }
      }
      // waitForFriendUpdateAsync();
    } catch (err) {
      // console(err);
    }
  }

  const waitForFriendUpdateAsync = async () => {
    // Case 1: Sender sends friend request to receiver. Update receiver's side to reject and accept buttons.
    waitForFriend = API.graphql<GraphQLSubscription<{onCreateFriendship: Friendship}>>(
      graphqlOperation(createFriendship, {
        sender: userId,
        receiver: globalThis.myId
      })
    ).subscribe({
      next: (event) => {
        const newFriendRequest = event.value.data?.onCreateFriendship
        if (newFriendRequest) {
          setFriendStatus("received")
        }
      }
    })

    // Case 2: Receiver accepts friend request. Update the sender's side to delete button.
    onUpdate = API.graphql<GraphQLSubscription<{onUpdateFriendship: Friendship}>>(
      graphqlOperation(updateFriendship, {
        sender: globalThis.myId,
        receiver: userId
      })
    ).subscribe({
      next: (event) => {
        const newFriend = event.value.data?.onUpdateFriendship
        if (newFriend?.accepted) {
          setFriendStatus("friends")
        }
      }
    })

    // Case 3: Receiver rejects friend request. Update the sender's side to send button.
    // Case 4: Friendship is deleted by either sender or receiver. Update the other party's side to send button.
    onDelete = API.graphql<GraphQLSubscription<{onDeleteFriendship: Friendship}>>(
      graphqlOperation(onDeleteFriendship, {
        sender: globalThis.myId,
        receiver: userId
      })
    ).subscribe({
      next: (event) => {
        const exFriend = event.value.data?.onDeleteFriendship
        if (exFriend?.sender == userId || exFriend?.receiver == userId) {
          setFriendStatus("none")
        }
      }
    })

    onDelete2 = API.graphql<GraphQLSubscription<{onDeleteFriendship: Friendship}>>(
      graphqlOperation(onDeleteFriendship, {
        sender: userId,
        receiver: globalThis.myId
      })
    ).subscribe({
      next: (event) => {
        const exFriend = event.value.data?.onDeleteFriendship
        if (exFriend?.sender == userId || exFriend?.receiver == userId) {
          setFriendStatus("none")
        }
      }
    })
  }

  const sendFriendRequest = async () => {
    setFriendStatus("sending")

    try {
      await API.graphql(
        graphqlOperation(createFriendship, { input: { receiver: user?.id } })
      )
      // console("success");
      setFriendStatus("sent") // if received, should change to "friends". do a check before this
      Alert.alert("Sent successfully!")
    } catch (err) {
      // console(err);
      Alert.alert("Could not be submitted!")
    }
  }

  const acceptFriendRequest = async () => {
    setFriendStatus("accepting")

    try {
      await API.graphql(
        graphqlOperation(updateFriendship, {
          input: { sender: user?.id, accepted: true }
        })
      )
      // console("success");
      setFriendStatus("friends")
      Alert.alert("Accepted successfully!")
    } catch (err) {
      // console(err);
      Alert.alert("Could not be accepted")
    }
  }

  const unsendFriendRequest = async (temp) => {
    if (!temp) setFriendStatus("unsending")
    /// /console(temp);
    try {
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { sender: globalThis.myId, receiver: user.id }
        })
      )
      // console("success");

      if (temp != true) {
        setFriendStatus("none")
        Alert.alert("Friend request unsent successfully!")
      }
    } catch (err) {
      // console(err);
      // console("error in unsending request: ");
    }
  }

  const rejectFriendRequest = async (temp) => {
    if (!temp) setFriendStatus("rejecting")

    try {
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { sender: user.id, receiver: globalThis.myId }
        })
      )
      // console("success");

      if (temp != true) {
        setFriendStatus("none")
        Alert.alert("Friend request rejected successfully!")
      }
    } catch (err) {
      // console(err);
      // console("error in rejecting friend: ");
    }
  }

  const deleteFriend = async (temp) => {
    if (!temp) setFriendStatus("deleting")

    try {
      const check = true
      rejectFriendRequest(check)
      unsendFriendRequest(check)
      if (!temp) setFriendStatus("none")

      Alert.alert("Deleted Friend successfully!")
    } catch (err) {
      // console(err);
      // console("error in deleting friend: ");
    }
  }

  const unblockUser = async () => {
    try {
      API.graphql(
        graphqlOperation(deleteBlock, {
          input: { userId: globalThis.myId, blockee: userId }
        })
      )
      globalThis.localBlockList = globalThis.localBlockList.filter(
        (i) => i.blockee !== userId
      )
      // console(global.localBlockList);
      setFriendStatus("none")
    } catch (err) {
      // console(err);
      // console("error when unblocking");
    }
  }

  const blockUser = async () => {
    try {
      deleteFriend(true)
      API.graphql(
        graphqlOperation(createBlock, { input: { blockee: userId } })
      )
      globalThis.localBlockList.push({
        createdAt: new Date(Date.now()).toISOString(),
        userId: globalThis.myId,
        blockee: userId
      })
      // console(global.localBlockList);
      setFriendStatus("blocker")
    } catch (err) {
      // console(err);
      // console("error when unblocking");
    }
  }

  const alertOptions = {
    cancelable: true
  }

  const openOptionsDialog = () => {
    const title = "More Options"
    const message = ""
    const options = [
      {
        text: "Block",
        onPress: () => {
          const title =
            "Are you sure you want to block this friend? This will unfriend them and delete all messages."
          const options = [
            {
              text: "Yes",
              onPress: blockUser
            },
            {
              text: "Cancel",
              type: "cancel"
            }
          ]
          Alert.alert(title, "", options, alertOptions)
        }
      }
    ]
    if (friendStatus === "friends") {
      options.push({
        text: "Unfriend",
        onPress: () => {
          const title = "Are you sure you want to unfriend?"
          const options = [
            {
              text: "Yes",
              onPress: deleteFriend
            },
            {
              text: "Cancel",
              type: "cancel"
            }
          ]
          Alert.alert(title, "", options, alertOptions)
        }
      })
    }
    options.push({
      text: "Cancel",
      type: "cancel"
    })
    Alert.alert(title, message, options, alertOptions)
  }

  return user == null
    ? null
    : (
    <ScrollView>
      <View style={{}}>
        <View style={{ flex: 1 }}>
          <ProfileImageAndName
            onPress={(imageURL) => {
              navigation.navigate("Image", { uri: imageURL })
            }}
            style={{ margin: 20 }}
            imageSize={Dimensions.get("window").width / 2 - 30}
            textStyle={{ fontWeight: "bold", fontSize: 24 }}
            textLayoutStyle={{ flex: 1 }}
            userId={userId}
            isFullSize={true}
            callback={(info) => {
              navigation.setOptions({ title: info.name })
            }}
            nameComponent={
              <View>
                <Text style={{ marginTop: 6, fontSize: 16 }}>{`(${user.age}, ${
                  user.gender
                }${
                  user.location
                    ? `${computeDistance(user.location)} mi. away`
                    : ""
                })`}</Text>
              </View>
            }
            spaceAfterName={true}
            subtitleComponent={
              <StatusIndicator
                status={user.status}
                isVerified={user.isVerified}
              />
            }
          />
        </View>
      </View>

      {user.bio
        ? (
        <View
          style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            marginBottom: 20,
            marginHorizontal: 20,

            elevation: 1,
            padding: 15,
            flex: 0
          }}
        >
          <Text style={{ fontSize: 18, color: "gray", marginBottom: 5 }}>
            Biography
          </Text>

          <Text style={{ fontSize: 18, color: "black" }}>
            {loadCapitals(user.bio)}
          </Text>
        </View>
          )
        : null}

      {user.goals
        ? (
        <View
          style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            marginBottom: 20,
            marginHorizontal: 20,

            elevation: 1,
            padding: 15,
            flex: 0
          }}
        >
          <Text style={{ fontSize: 18, color: "gray", marginBottom: 5 }}>
            Goals
          </Text>

          <Text style={{ fontSize: 18, color: "black" }}>
            {loadCapitals(user.goals)}
          </Text>
        </View>
          )
        : null}

      {!(friendStatus == "blocker" || friendStatus == "blocked") &&
      globalThis.myId != user.id
        ? (
        <View
          style={{
            alignItems: "stretch",
            flexDirection: "column",
            marginHorizontal: 20,
            marginTop: 5
          }}
        >
          {!user.friendRequestPrivacy ||
          user.friendRequestPrivacy === 0 ||
          (areMutualFriends && user.friendRequestPrivacy === 1) ||
          (friendStatus === "friends" && user.friendRequestPrivacy >= 1)
            ? (
                friendStatus === "none"
                  ? (
              <IconButton
                style={{
                  flex: 1,
                  borderColor: "blue",
                  borderWidth: 1,
                  padding: 15,
                  justifyContent: "center"
                }}
                iconName={"person-add"}
                size={24}
                color={"blue"}
                onPress={sendFriendRequest}
                label={"Add Friend"}
              />
                    )
                  : friendStatus === "sending"
                    ? (
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  marginTop: 2,
                  padding: 16,
                  alignSelf: "center"
                }}
              >
                Sending Request...
              </Text>
                      )
                    : friendStatus === "sent"
                      ? (
              <IconButton
                style={{
                  flex: 1,
                  borderColor: "red",
                  borderWidth: 1,
                  padding: 15,
                  justifyContent: "center"
                }}
                iconName={"person-remove"}
                size={24}
                color={"red"}
                onPress={unsendFriendRequest}
                label={"Unsend Request"}
              />
                        )
                      : friendStatus === "unsending"
                        ? (
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  marginTop: 2,
                  alignSelf: "center"
                }}
              >
                Unsending Request...
              </Text>
                          )
                        : friendStatus == "received"
                          ? (
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <IconButton
                  style={{
                    flex: 1,
                    borderColor: "green",
                    borderWidth: 1,
                    padding: 15,
                    paddingVertical: 5,
                    marginRight: 10,
                    justifyContent: "center"
                  }}
                  iconName={"person-add"}
                  size={24}
                  color={"green"}
                  onPress={acceptFriendRequest}
                />
                <IconButton
                  style={{
                    flex: 1,
                    borderColor: "red",
                    borderWidth: 1,
                    padding: 15,
                    paddingVertical: 5,
                    marginLeft: 10,
                    justifyContent: "center"
                  }}
                  iconName={"person-remove"}
                  size={24}
                  color={"red"}
                  onPress={rejectFriendRequest}
                />
              </View>
                            )
                          : friendStatus === "rejecting"
                            ? (
              <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 2 }}>
                Rejecting Request...
              </Text>
                              )
                            : friendStatus === "accepting"
                              ? (
              <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 2 }}>
                Accepting Request...
              </Text>
                                )
                              : friendStatus === "deleting"
                                ? (
              <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 2 }}>
                Removing Friend...
              </Text>
                                  )
                                : friendStatus === "friends"
                                  ? (
              <View>
                <View style={[styles.viewProfileScreen]}>
                  <Text style={{ fontSize: 16 }}>
                    Friends for {friendsSince}{" "}
                  </Text>
                </View>
              </View>
                                    )
                                  : null
              )
            : null}
          <View
            style={{
              flexDirection: "row",
              marginTop: friendStatus === "friends" ? 0 : 20
            }}
          >
            {!user.messagesPrivacy ||
            user.messagesPrivacy === 0 ||
            (areMutualFriends && user.messagesPrivacy === 1) ||
            (friendStatus === "friends" && user.messagesPrivacy >= 1)
              ? (
              <IconButton
                style={{
                  flex: 1,
                  borderColor: "blue",
                  borderWidth: 1,
                  padding: 15,
                  marginLeft: 10,
                  justifyContent: "center"
                }}
                iconName={"message"}
                size={24}
                color={"blue"}
                onPress={() => {
                  navigation.navigate(userId)
                }}
                label={"Message"}
              />
                )
              : null}
            <IconButton
              iconName={"more-vert"}
              size={24}
              color={"black"}
              onPress={openOptionsDialog}
            />
          </View>
        </View>
          )
        : null}

      <View>
        {areMutualFriends
          ? (
          <View style={styles.viewProfileScreen}>
            <Text style={{ fontSize: 20, fontWeight: "normal", marginTop: 30 }}>
              Mutual Friends{" "}
            </Text>
          </View>
            )
          : null}
      </View>
      <View>
        <APIList
          ref={listRef}
          initialAmount={10}
          additionalAmount={20}
          horizontal={true}
          queryOperationName={"listFriendships"}
          queryOperation={listFriendships}
          processingFunction={collectMutualFriends}
          renderItem={({ item }) => (
            <ProfileImageAndName
              style={{ marginHorizontal: 20 }}
              vertical={true}
              userId={item}
            />
          )}
          keyExtractor={(item: string) => item}
        />
      </View>

      {global.location != null && user.location != null
        ? (
        <Text style={styles.viewProfileScreen}>
          {computeDistance(user.location)} mi. away
        </Text>
          )
        : null}
      {globalThis.myId != user.id
        ? (
        <View style={styles.buttonFormat}>
          {friendStatus == "loading"
            ? (
            <ActivityIndicator
              size="large"
              color="#26c6a2"
              style={{
                flex: 1,
                justifyContent: "center",
                flexDirection: "row",
                padding: 10
              }}
            />
              )
            : friendStatus == "blocked"
              ? null
              : friendStatus == "blocker"
                ? (
            <TouchableOpacity
              onPress={unblockUser}
              style={{
                borderColor: "black",
                borderWidth: 1,
                padding: 15,
                alignItems: "center",
                margin: 20
              }}
            >
              <Text
                style={{ color: "black", fontWeight: "bold", fontSize: 20 }}
              >
                Unblock
              </Text>
            </TouchableOpacity>
                  )
                : null}
        </View>
          )
        : null}
    </ScrollView>
      )
}

export default LookupUser

const styles = StyleSheet.create({
  viewProfileScreen: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20
  },
  buttonFormat: {}
})