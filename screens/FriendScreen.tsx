import API, { GraphQLQuery, GraphQLSubscription } from "@aws-amplify/api"
import Accordion from "@components/Accordion"
import FriendListItem from "@components/FriendListItem"
import FriendRequestListItem from "@components/FriendRequestListItem"
import { createBlock, deleteFriendship, updateConversation, updateFriendship } from "@graphql/mutations"
import { friendsByReceiver, listFriendships } from "@graphql/queries"
import {
  onAcceptedFriendship,
  onCreateFriendRequestForReceiver,
  onCreatePostForReceiver,
  onDeleteFriendship
} from "@graphql/subscriptions"
import playSound from "@hooks/playSound"
import { useNavigation } from "@react-navigation/native"
import { graphqlOperation } from "aws-amplify"
import React, { useEffect, useRef } from "react"
import { LayoutAnimation, SafeAreaView, Text } from "react-native"
import { Conversation, Friendship, Post } from "src/models"
import APIList, { APIListRefType } from "../components/APIList"
import {
  batchGetConversations,
  getConversation
} from "../src/graphql/queries"
// conversations and friends should be deleted when user is deleted

const subscriptions = []

type FriendshipWithMessagePreview = Friendship & Pick<Conversation, "lastMessage" | "lastUser">;

function FriendList () {
  const listRef = useRef<APIListRefType<FriendshipWithMessagePreview>>(null)

  globalThis.addMyMessageToFriendsList = (newPost) => {
    listRef.current?.replaceItem((friend) => (
      newPost.receiver === friend.receiver ||
      newPost.receiver === friend.sender
    ), {
      ...newPost,
      lastMessage: newPost.description,
      lastUser: globalThis.myId
    })
  }

  const addMessagePreview = async (newItem: FriendshipWithMessagePreview) => {
    const conversation = await API.graphql<GraphQLQuery<{getConversation: Conversation}>>(
      graphqlOperation(getConversation, {
        id: [newItem.sender, newItem.receiver].sort().join("")
      })
    )

    if (conversation.data?.getConversation != null) {
      newItem = {
        ...newItem,
        lastMessage: conversation.data?.getConversation.lastMessage,
        lastUser: conversation.data?.getConversation.lastUser
      }
    }

    listRef.current?.addItem(newItem, (item) => item.sender === newItem.sender && item.receiver === newItem.receiver)
  }

  useEffect(() => {
    const receivedConversationSubscription = API.graphql<GraphQLSubscription<{onCreatePostForReceiver: Post}>>(
      graphqlOperation(onCreatePostForReceiver, {
        receiver: globalThis.myId
      })
    ).subscribe({
      next: (event) => {
        // no need for security checks here
        const newPost = event.value.data?.onCreatePostForReceiver

        if (newPost) {
          listRef.current?.replaceItem((friend) => (
            newPost?.receiver === friend.receiver ||
            newPost?.receiver === friend.sender
          ), {
            lastMessage: newPost.description ?? "",
            lastUser: newPost.userId ?? ""
          })
        }
        // foreach users in conversation, if it's not myid and it's in friend list, update friend list, and push it to the top.
        // alternatively for message screen, for each user in message screen, if it's in conversation push it to the top. otherwise just put this conversation at the top of the list.
      },
      error: error => console.warn(error)
    })

    const friendSubscription = API.graphql<GraphQLSubscription<{onAcceptedFriendship: Friendship}>>(
      graphqlOperation(onAcceptedFriendship)
    ).subscribe({
      next: async (event) => {
        const newFriend = event.value.data?.onAcceptedFriendship
        // we can see all friend requests being accepted, so we just have to make sure it's one of ours.
        if (
          newFriend?.sender === globalThis.myId ||
          newFriend?.receiver === globalThis.myId
        ) {
          addMessagePreview(newFriend as FriendshipWithMessagePreview)
        }
      },
      error: error => console.warn(error)
    })

    const removedFriendSubscription = API.graphql<GraphQLSubscription<{onDeleteFriendship: Friendship}>>(
      graphqlOperation(onDeleteFriendship)
    ).subscribe({
      next: (event) => {
        const deletedFriend = event.value.data?.onDeleteFriendship // check the security on this one. if possible, should only fire for the sender or receiver.
        listRef.current?.removeItem(
          (item) =>
            item.sender === deletedFriend?.sender &&
              item.receiver === deletedFriend?.receiver
        )
      },
      error: error => console.warn(error)
    })
  }, [])

  const fetchLatestMessagesFromFriends = async (items: FriendshipWithMessagePreview[]) => {
    const conversationIds: {id: string}[] = []

    items.forEach((item) => {
      conversationIds.push({
        id: [item.sender, item.receiver].sort().join("")
      })

      globalThis.addConversationIds(
        item.sender == globalThis.myId ? item.receiver : item.sender
      )
    })

    try {
      const conversations = await API.graphql<GraphQLQuery<{batchGetConversations: [Conversation]}>>(
        graphqlOperation(batchGetConversations, { ids: conversationIds })
      )
      // returns an array of like objects or nulls corresponding with the array of conversations
      for (let i = 0; i < items.length; ++i) {
        if (conversations.data?.batchGetConversations[i] != null) {
          items[i] = {
            ...items[i],
            lastMessage: conversations.data?.batchGetConversations[i].lastMessage,
            lastUser: conversations.data?.batchGetConversations[i].lastUser
          }
        }
      }
      return items
    } catch (err) {
      console.log("error in getting latest messages: ", err)
    }
  }

  const removeFriend = async (item: Friendship, blocked: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    // update friendList
    listRef.current?.removeItem((i) => i.sender === item.sender && i.receiver === item.receiver)

    // delete friend object
    try {
      if (blocked) {
        globalThis.localBlockList.push({
          createdAt: new Date(Date.now()).toISOString(),
          userId: globalThis.myId,
          blockee:
            item.receiver == globalThis.myId ? item.sender : item.receiver
        })
        API.graphql(
          graphqlOperation(createBlock, {
            input: {
              blockee:
                item.receiver == globalThis.myId
                  ? item.sender
                  : item.receiver
            }
          })
        )
      }
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { sender: item.sender, receiver: item.receiver }
        })
      )
    } catch (err) {
      console.log("error: ", err)
    }
  }

  return (
    <APIList
      ListHeaderComponent={
        <Text
          style={{
            fontSize: 20,
            color: "black",
            margin: 18
          }}
        >
          Friends
        </Text>
      }
      style={{}}
      ref={listRef}
      queryOperationName={"listFriendships"}
      queryOperation={listFriendships}
      filter={{
        filter: {
          and: [
            {
              or: [
                {
                  sender: {
                    eq: globalThis.myId
                  }
                },
                {
                  receiver: {
                    eq: globalThis.myId
                  }
                }
              ]
            },
            {
              accepted: {
                eq: true
              }
            }
          ]
        }
      }} // a batch function should be used to grab message previews. that would also make it easy to exclude any.
      processingFunction={fetchLatestMessagesFromFriends as any}
      initialAmount={15}
      additionalAmount={15}
      renderItem={({ item }) => (
        <FriendListItem
          removeFriendHandler={removeFriend}
          item={item}
          sidebar={true}
          friendId={
            item.sender === globalThis.myId ? item.receiver : item.sender
          }
          lastMessage={item.lastMessage}
          lastUser={item.lastUser}
          Accepted={item.Accepted}
        />
      )}
      keyExtractor={(item: Friendship) => item.createdAt.toString()}
      ListEmptyMessage={"No friends yet!"}
    />
  )
}

export default function FriendScreen () {
  const navigation = useNavigation()
  const listRef = useRef<APIListRefType<Friendship>>(null)

  // runs when either for accepting or rejecting a friend request
  const confirmResponse = async (item: Friendship, isNew?: boolean) => {
    if (listRef.current?.getList().length === 1) playSound("celebrate")

    try {
      if (item.accepted) {
        const conversationId = [item.sender, item.receiver].sort().join()

        const newConversation = await API.graphql<GraphQLQuery<{getConversation: Conversation}>>(
          graphqlOperation(getConversation, { id: conversationId })
        )

        if (newConversation.data?.getConversation != null) {
          await API.graphql(
            graphqlOperation(updateConversation, {
              input: { id: conversationId, Accepted: 1 }
            })
          )
        }

        await API.graphql(
          graphqlOperation(updateFriendship, {
            input: { sender: item.sender, accepted: true }
          })
        )
        // console.log("accepted: " + accepted);
      } else {
        await API.graphql(
          graphqlOperation(deleteFriendship, {
            input: { sender: item.sender, receiver: item.receiver }
          })
        )
      }
    } catch (err) {
      console.log("error responding to request: ", err)
    }
  }

  useEffect(() => {
    const friendRequestSubscription = API.graphql<GraphQLSubscription<{onCreateFriendRequestForReceiver: Friendship}>>(
      graphqlOperation(onCreateFriendRequestForReceiver, {
        receiver: globalThis.myId
      })
    ).subscribe({
      next: (event) => {
        const newFriendRequest =
          event.value.data?.onCreateFriendRequestForReceiver

        if (newFriendRequest) {
          if (
            newFriendRequest?.sender !== globalThis.myId &&
            newFriendRequest?.receiver !== globalThis.myId
          ) { listRef.current?.addItem(newFriendRequest, (item) => item.sender === newFriendRequest.sender && item.receiver === newFriendRequest.receiver) }
        }
      },
      error: error => console.warn(error)
    })
  }, [])

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

  // instead of accordions we'll just use plain header texts
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Accordion
        style={{ marginTop: 0 }}
        initialOpen={(listRef?.current?.getList().length ?? 0) > 0}
        headerText={"Friend Requests"} // would be nice if we had a total friend request count. but then you'd be able to see when people revoke their friend requests.
        headerTextStyle={{
          fontSize: 18,
          color: "gray",
          textDecorationLine: "none",
          marginLeft: 18
        }}
        openTextColor={"black"}
        iconColor={"gray"}
        iconOpenColor={"black"}
        empty={false}
      >
        <APIList
          style={{}}
          queryOperation={friendsByReceiver}
          queryOperationName={"friendsByReceiver"}
          filter={{
            receiver: globalThis.myId,
            sortDirection: "DESC",
            filter: {
              accepted: {
                attributeExists: false
              }
            }
          }}
          ref={listRef}
          initialAmount={21}
          additionalAmount={15}
          renderItem={({ item, index }, operations) => (
            <FriendRequestListItem
              item={item}
              operations={operations}
              confirmResponseHandler={confirmResponse}
              isNew={
                index < 20 // route.params.newfriendrequests
              }
            />
          )}
          keyExtractor={(item: Friendship) => item.sender}
          ListEmptyMessage={"No new requests!"}
        />
      </Accordion>
      <FriendList />
    </SafeAreaView>
  )
}
