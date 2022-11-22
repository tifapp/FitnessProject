import API, { GraphQLQuery, GraphQLSubscription } from "@aws-amplify/api";
import Accordion from "@components/Accordion";
import FriendListItem from "@components/FriendListItem";
import FriendRequestListItem from "@components/FriendRequestListItem";
import { createBlock, deleteFriendship, updateConversation, updateFriendship } from "@graphql/mutations";
import { friendsByReceiver, listFriendships } from "@graphql/queries";
import {
  onAcceptedFriendship,
  onCreateFriendRequestForReceiver,
  onCreatePostForReceiver,
  onDeleteFriendship
} from "@graphql/subscriptions";
import { useNavigation } from "@react-navigation/native";
import { graphqlOperation } from "aws-amplify";
import React, { useEffect, useRef } from "react";
import { LayoutAnimation, SafeAreaView, Text } from "react-native";
import { Conversation, Friendship, Post } from "src/models";
import APIList, { APIListRefType } from "../components/APIList";
import {
  batchGetConversations,
  getConversation,
  //getSortedConversations,
  listConversations
} from "../src/graphql/queries";
//import { listConversations } from "../amplify/#current-cloud-backend/function/backendResources/opt/queries";
//conversations and friends should be deleted when user is deleted

const subscriptions = [];

function FriendList() {
  const listRef = useRef<APIListRefType<Friendship>>(null);

  global.updateFriendsListWithMyNewMessage = (newPost) => {
    listRef.current?.mutateData((friends) => {
      return friends.map((friend) => {
        if (
          newPost.receiver === friend.receiver ||
          newPost.receiver === friend.sender
        ) {
          friend.lastMessage = newPost.description;
          friend.lastUser = globalThis.myId;
        }
        return friend;
      });
    });
  };

  const loadLastMessageAndListenForNewOnes = async (newFriend) => {
    //if (currentFriends.current.find(item => item.sender === newFriend.sender && item.receiver === newFriend.receiver)) return;
    //check if a convo already exists between the two users
    const friendlistarray = [newFriend.sender, newFriend.receiver].sort();

    const convo = await API.graphql(
      graphqlOperation(getConversation, {
        id: friendlistarray[0] + friendlistarray[1],
      })
    );

    if (convo.data?.getConversation != null) {
      console.log("found old condo");
      newFriend.lastMessage = convo.data?.getConversation.lastMessage;
      newFriend.lastUser = convo.data?.getConversation.lastUser;
    } else {
      console.log("couldnt find condo");
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    listRef.current?.addItem(newFriend);
  };

  /*
  useEffect(() => {
    friendList.forEach((friend) =>
      global.addConversationIds(
        friend.sender == globalThis.myId ? friend.receiver : friend.sender
      )
    );
  }, [friendList]); //we must extract just the array of ids
  */

  useEffect(() => {
    const receivedConversationSubscription = API.graphql<GraphQLSubscription<{onCreatePostForReceiver: Post}>>(
      graphqlOperation(onCreatePostForReceiver, {
        receiver: globalThis.myId,
      })
    ).subscribe({
      next: (event) => {
        //no need for security checks here
        listRef.current.mutateData((friends) => {
          return friends.map((friend) => {
            if (
              newPost.userId === friend.sender ||
              newPost.userId === friend.receiver
            ) {
              friend.lastMessage = newPost.description;
              friend.lastUser = newPost.userId;
              friend.isRead = null;
            }
            return friend;
          });
        });
        //foreach users in conversation, if it's not myid and it's in friend list, update friend list, and push it to the top.
        //alternatively for message screen, for each user in message screen, if it's in conversation push it to the top. otherwise just put this conversation at the top of the list.
      },
      error: error => console.warn(error)
    });

    const friendSubscription = API.graphql<GraphQLSubscription<{onAcceptedFriendship: Friendship}>>(
      graphqlOperation(onAcceptedFriendship)
    ).subscribe({
      next: async (event) => {
        console.log("friend subscription fired ");

        const newFriend = event.value.data?.onAcceptedFriendship;
        //we can see all friend requests being accepted, so we just have to make sure it's one of ours.
        if (
          newFriend.sender === globalThis.myId ||
          newFriend.receiver === globalThis.myId
        ) {
          loadLastMessageAndListenForNewOnes(newFriend);
        }

        if (global.checkFriendshipMessage !== undefined) {
          let backupConversation = await API.graphql(
            graphqlOperation(getConversationByUsers, {
              users: [newFriend.sender, newFriend.receiver].sort(),
            })
          );
          console.log("Message Screen is unopened");

          backupConversation =
            backupConversation.data?.getConversationByUsers.items[0];
          global.checkFriendshipMessage(backupConversation);
        }

        if (
          global.checkFriendshipMessage !== undefined &&
          global.checkFriendshipConversation !== undefined
        ) {
          console.log(
            "Both the Message Screen and Conversation Screens are opened"
          );
          const conversation = global.checkFriendshipMessage(
            newFriend.sender,
            newFriend.receiver
          );
          global.checkFriendshipConversation(conversation);
        }
      },
      error: error => console.warn(error)
    });

    const removedFriendSubscription = API.graphql<GraphQLSubscription<{onDeleteFriendship: Friendship}>>(
      graphqlOperation(onDeleteFriendship)
    ).subscribe({
      next: (event) => {
        const deletedFriend = event.value.data?.onDeleteFriendship; //check the security on this one. if possible, should only fire for the sender or receiver.
        listRef.current.mutateData((currentFriends) => {
          const index = currentFriends.findIndex(
            (item) =>
              item.sender === deletedFriend.sender &&
              item.sender === deletedFriend.sender
          );
          if (index > -1) {
            currentFriends.splice(index, 1);
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
          }
          return currentFriends;
        });
      },
      error: error => console.warn(error)
    });
  }, []);

  const fetchLatestMessagesFromFriends = async (items: Friendship[]) => {
    console.log(items);

    const conversationIds: {id: string}[] = [];

    items.forEach((item) => {
      conversationIds.push({
        id:
          item.sender < item.receiver
            ? item.sender + item.receiver
            : item.receiver + item.sender,
      });
    });

    try {
      const conversations = await API.graphql<GraphQLQuery<{batchGetConversations: [Conversation]}>>(
        graphqlOperation(batchGetConversations, { ids: conversationIds })
      );
      //console.log("looking for conversations: ", conversations);
      //returns an array of like objects or nulls corresponding with the array of conversations
      for (let i = 0; i < items.length; ++i) {
        if (conversations.data?.batchGetConversations[i] != null) {
          console.log("found conversation");
          items[i].lastMessage =
            conversations.data?.batchGetConversations[i].lastMessage;
          items[i].lastUser =
            conversations.data?.batchGetConversations[i].lastUser; //could also store the index of lastuser from the users array rather than the full string
        }
      }
      return items;
    } catch (err) {
      console.log("error in getting latest messages: ", err);
    }
  };

  const removeFriend = async (item, blocked) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // update friendList
    listRef.current?.removeItem((i) => i.sender === item.sender && i.receiver === item.receiver);

    // delete friend object
    try {
      if (blocked) {
        global.localBlockList.push({
          createdAt: new Date(Date.now()).toISOString(),
          userId: globalThis.myId,
          blockee:
            item.receiver == globalThis.myId ? item.sender : item.receiver,
        });
        API.graphql(
          graphqlOperation(createBlock, {
            input: {
              blockee:
                item.receiver == globalThis.myId
                  ? item.sender
                  : item.receiver,
            },
          })
        );
      }
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { sender: item.sender, receiver: item.receiver },
        })
      );
    } catch (err) {
      console.log("error: ", err);
    }
  };

  return (
    <APIList
      ListHeaderComponent={
        <Text
          style={{
            fontSize: 20,
            color: "black",
            margin: 18,
          }}
        >
          Friends
        </Text>
      }
      style={{}}
      ref={listRef}
      queryOperation={listFriendships}
      filter={{
        filter: {
          and: [
            {
              or: [
                {
                  sender: {
                    eq: globalThis.myId,
                  },
                },
                {
                  receiver: {
                    eq: globalThis.myId,
                  },
                },
              ],
            },
            {
              accepted: {
                eq: true,
              },
            },
          ],
        },
      }} //a batch function should be used to grab message previews. that would also make it easy to exclude any.
      processingFunction={fetchLatestMessagesFromFriends}
      initialAmount={15}
      additionalAmount={15}
      renderItem={({ item }) => (
        //!item.isRead ?
        <FriendListItem
          removeFriendHandler={removeFriend}
          item={item}
          sidebar={true}
          friendId={
            item.sender === globalThis.myId ? item.receiver : item.sender
          }
          myId={globalThis.myId}
          lastMessage={item.lastMessage}
          lastUser={item.lastUser}
          Accepted={item.Accepted}
        />
        //: null
      )}
      keyExtractor={(item: Friendship) => item.createdAt.toString()}
      ListEmptyMessage={"No friends yet!"}
    />
  );
}

export default function FriendScreen() {
  const navigation = useNavigation();
  const listRef = useRef<APIListRefType<Friendship>>(null);

  // runs when either for accepting or rejecting a friend request
  const confirmResponse = async (item: Friendship, isNew?: boolean) => {
    //if (listRef.current.getData().length == 1) playSound("celebrate");

    try {
      if (item.accepted) {
        const conversationId = [item.sender, item.receiver].sort().join();

        const newConversation = await API.graphql(
          graphqlOperation(getConversation, { id: conversationId })
        );

        console.log(newConversation);

        if (newConversation.data?.getConversation != null) {
          await API.graphql(
            graphqlOperation(updateConversation, {
              input: { id: conversationId, Accepted: 1 },
            })
          );
        }

        await API.graphql(
          graphqlOperation(updateFriendship, {
            input: { sender: item.sender, accepted: true },
          })
        );
        //console.log("accepted: " + accepted);
      } else {
        await API.graphql(
          graphqlOperation(deleteFriendship, {
            input: { sender: item.sender, receiver: item.receiver },
          })
        );
      }
    } catch (err) {
      console.log("error responding to request: ", err);
    }
  };

  useEffect(() => {
    /*
    Cache.getItem("lastOnline", {
      callback: () => {
        setLastOnlineTime(-1);
      },
    }) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
      .then((time) => {
        setLastOnlineTime(time);
      });
      */ //should be in a parent component or context

    // Executes when a user receieves a friend request
    // listening for new friend requests
    const friendRequestSubscription = API.graphql<GraphQLSubscription<{onCreateFriendRequestForReceiver: Friendship}>>(
      graphqlOperation(onCreateFriendRequestForReceiver, {
        receiver: globalThis.myId,
      })
    ).subscribe({
      next: (event) => {
        //IMPORTANT: don't use "friendList" or "friendRequestList" variables in this scope, instead use "currentFriends.current" and "currentFriendRequests.current"

        //console.log("is drawer open? ", isDrawerOpen.current);
        const newFriendRequest =
          event.value.data?.onCreateFriendRequestForReceiver;
        if (
          newFriendRequest.sender !== globalThis.myId &&
          newFriendRequest.receiver !== globalThis.myId
        )
          console.log("security error with incoming friend request");

        //if this new request is coming from someone already in your local friends list, remove them from your local friends list
        //if (currentFriends.current.find((item) => item.sender === newFriendRequest.sender)) {
        /*
        listRef.current.mutateData((currentFriends) =>
          currentFriends.filter(
            (item) =>
              item.sender != newFriendRequest.sender ||
              item.receiver != newFriendRequest.sender
          )
        );
        //}
        */

        //if this new request is not already in your local friend request list, add it to your local friend request list
        if (
          currentFriendRequests.current.find(
            (item) => item.sender === newFriendRequest.sender
          )
        ) {
          listRef.current.mutateData((currentFriendRequests) =>
            currentFriendRequests.current.filter(
              (item) =>
                item.sender != newFriendRequest.sender ||
                item.receiver != newFriendRequest.sender
            )
          );
        }

        //if the drawer is closed, show the blue dot in the corner
        global.showNotificationDot();

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        listRef.current.mutateData((currentFriendRequests) => [
          newFriendRequest,
          ...currentFriendRequests,
        ]);
      },
      error: error => console.warn(error)
    });

    return () => {
      currentFriendRequests.current.forEach((item) => {
        if (item.accepted != null) confirmResponse(item);
      }); //or have this in the blur event
    };
  }, []);

  //setButton(false);

  /*
  // delete friend object
  try {
    if (blocked) {
      global.localBlockList.push({createdAt: (new Date(Date.now())).toISOString(), userId: globalThis.myId , blockee: item.receiver == globalThis.myId ? item.sender : item.receiver});
      API.graphql(
        graphqlOperation(createBlock, {
          input: { blockee: item.receiver == globalThis.myId ? item.sender : item.receiver },
        })
      );
    }
    await API.graphql(
      graphqlOperation(deleteFriendship, {
        input: { sender: item.sender, receiver: item.receiver },
      })
    );
  } catch (err) {
    //console("error: ", err);
  }
  */

  useEffect(() => {
    (async () => {
      try {
        const conversation = await API.graphql(
          graphqlOperation(listConversations)
        );
        const conversation1 = await API.graphql(
          graphqlOperation(getSortedConversations, { dummy: 0, Accepted: 0 })
        );

        console.log(conversation);
        console.log("########################");
        console.log(conversation1);

        console.log("Use Effect for getSortedConversations");
      } catch (err) {
        console.log("error: ", err);
      }
    })();
  }, []);

  const goToMessages = (id: string) => {
    if (!navigation.push) navigation.navigate(id);
    else navigation.push(id);
  };

  //instead of accordions we'll just use plain header texts
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Accordion
        style={{ marginTop: 0 }}
        open={
          //friendRequestList.length > 0
          false
        }
        headerText={"Friend Requests"} //would be nice if we had a total friend request count. but then you'd be able to see when people revoke their friend requests.
        headerTextStyle={{
          fontSize: 18,
          color: "gray",
          textDecorationLine: "none",
          marginLeft: 18,
        }}
        openTextColor={"black"}
        iconColor={"gray"}
        iconOpenColor={"black"}
        empty={false}
      >
        <APIList
          style={{}}
          //initialLoadFunction={checkNewRequests}
          queryOperation={friendsByReceiver}
          queryOperationName={"friendsByReceiver"}
          filter={{
            receiver: globalThis.myId,
            sortDirection: "DESC",
            filter: {
              accepted: {
                attributeExists: false,
              },
            },
          }}
          ref={listRef}
          initialAmount={21}
          additionalAmount={15}
          renderItem={({ item, index }, operations) => (
            <FriendRequestListItem
              item={item}
              operations={operations}
              confirmResponseHandler={confirmResponse}
              myId={globalThis.myId}
              isNew={
                index < //< route.params.newfriendrequests
                20
              }
            />
          )}
          keyExtractor={(item: Friendship) => item.sender}
          ListEmptyMessage={"No new requests!"}
        />
      </Accordion>
      <FriendList />
    </SafeAreaView>
  );
}
