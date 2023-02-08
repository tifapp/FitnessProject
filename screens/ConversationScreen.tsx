import API, { GraphQLResult, GraphQLSubscription } from "@aws-amplify/api"
import APIList, { APIListRefType } from "@components/APIList"
import FriendListItem from "@components/FriendListItem"
import { deleteConversation } from "@graphql/mutations"
import {
  onCreatePostByUser,
  onCreatePostForReceiver
} from "@graphql/subscriptions"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { graphqlOperation } from "aws-amplify"
import React, { useEffect, useRef } from "react"
import { SafeAreaView } from "react-native"
import { Conversation, Post } from "src/models"
import {
  listConversations
} from "../src/graphql/queries"

const subscriptions = []

export default function ConversationScreen () {
  const { navigate, push } = useNavigation<StackNavigationProp<any>>()
  const listRef = useRef<APIListRefType<Conversation>>(null)

  const updateConversationList = async (newPost: Post) => {
    /*
    global.checkFriendshipConversation = (conversation) => {

      let tempConversations = currentConversations.current;

      tempConversations.unshift(conversation);

      setConversations([...tempConversations]);
    }
    */

    /*
    let tempConversations = listRef.current.getData();

    let newConversation = tempConversations.find(
      (item) => newPost.channel === item.id
    );
    */

    /*

    let newConversationCheck = await API.graphql(graphqlOperation(getConversations, { Accepted: 0, sortDirection: 'DESC'}));
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
    console.log(newConversationCheck);
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
    */

    // if(newConversationCheck.data.getConversations.items.length != 0){
    // console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||")
    // console.log(newConversationCheck.data.getConversations.items);
    // console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||")

    // console.log(newConversationCheck.data.getConversations.items[0].id)

    // newConversationCheck = newConversationCheck.data.getConversations.items[0].id === newPost.channel;

    /*
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log(newPost.channel);
    console.log(newConversationCheck);
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    */

    // if(newConversationCheck){
    // console.log("Conversation already exists");
    // return;
    // }
    // }

    // console.log("Outside");

    // we may be able to separate this code into a util function that checks the current list of data for a matching item, and if not, makes a call to the backend for a matching item.

    if (true) {
      let newConversation = await API.graphql<GraphQLResult<{getSortedConversations: [Conversation]}>>(
        graphqlOperation(getSortedConversations, {
          dummy: 0,
          Accepted: 1,
          limit: 1
        })
      )

      if (newConversation != null) {
        newConversation = { id: newConversation.data.id }
      } else {
        newConversation = { id: null }
      }
    }

    if (true) {
      const conversation = {
        id: newPost.channel,
        users: [newPost.userId, newPost.receiver],
        lastUser: newPost.userId,
        lastMessage: newPost.description,
        Accepted: 1
      }

      // console.log("++++++++++++++++++++++++++++++++");
      // console.log(conversation);
      // console.log("++++++++++++++++++++++++++++++++");

      listRef.current?.removeItem((item) => newPost.channel === item.id)
      listRef.current?.addItem(conversation)
    } else {
    }
  }

  useEffect(() => {
    // Executes when a user receieves a friend request
    // listening for new friend requests

    const receivedConversationSubscription = API.graphql<GraphQLSubscription<{onCreatePostForReceiver: Post}>>(
      graphqlOperation(onCreatePostForReceiver, { receiver: globalThis.myId })
    ).subscribe({
      next: (event) => {
        const newPost = event.value.data?.onCreatePostForReceiver
        global.addConversationIds(newPost.userId)
        global.showNotificationDot()
        updateConversationList(newPost)
      },
      error: error => console.warn(error)
    })

    const sentConversationSubscription = API.graphql(
      graphqlOperation(onCreatePostByUser, { userId: globalThis.myId })
    ).subscribe({
      next: (event) => {
        const newPost = event.value.data.onCreatePostByUser

        updateConversationList(newPost)
      },
      error: error => console.warn(error)
    })

    return () => {
      receivedConversationSubscription.unsubscribe()
      sentConversationSubscription.unsubscribe()
      subscriptions.forEach((element) => {
        element.unsubscribe()
      })
    }
  }, [])

  // const [button, setButton] = useRef();

  const deleteConversationFromConvo = async (item, friendID) => {
    /*
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // update friendList
    setFriendList((friendList) => {
      return friendList.filter(
        (i) => i.sender !== item.sender || i.receiver !== item.receiver
      );
    });
    */

    // update ConversationList

    listRef.current?.removeItem(
      (conversation) =>
        conversation.users[0] !== friendID || conversation.users[1] !== friendID
    )

    await API.graphql(
      graphqlOperation(deleteConversation, {
        input: { id: item.id }
      })
    )

    // setButton(false);

    /*
    // delete friend object
    try {
      if (blocked) {
        global.localBlockList.push({createdAt: (new Date(Date.now())).toISOString(), userId: myId , blockee: item.receiver == myId ? item.sender : item.receiver});
        API.graphql(
          graphqlOperation(createBlock, {
            input: { blockee: item.receiver == myId ? item.sender : item.receiver },
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
  }

  /*
  useEffect(() => {
    //console("Inside delete Conversation Subscription");
    for (let i = 0; i < conversations.length; i++) {
      (async () => {
        subscriptions.push(
          await API.graphql(
            graphqlOperation(onDeleteConversation, {
              users: conversations[i].users,
            })
          ).subscribe({
            next: (event) => {
              const conversation = event.value.data.onDeleteConversation;
              //console.log("Inside the onDeleteConversation Subscription");
              listRef.current.mutateData((conversations) => {
                return conversations.filter(
                  (convo) => convo.id != conversation.id
                );
              });
            },
          })
        );
      })();
    }
  });
  */

  const goToMessages = (id) => {
    if (!push) navigate(id)
    else push(id)
  }

  const collectConversations = (items) => {
    // what if conversations array shrinks? we should remove from the conversationids array

    // console("1. Inside collect Conversations");
    // console(items);

    items.forEach((element) => {
      let userId = null
      if (element.users[0] != globalThis.myId) {
        userId = element.users[0]
      } else {
        userId = element.users[1]
      }
      global.addConversationIds(userId)
    })
    return items
  }

  /*
    <View style= {[styles.containerStyle, {marginVertical: 5}]}>

                    <ProfileImageAndName
                      imageStyle={[styles.smallImageStyle, { marginHorizontal: 20 }]}
                      userId={ item.users[0] == route.params.myId ? item.users[1] : item.users[0]}
                      subtitleComponent = {<TouchableOpacity
                        onPress={() => {
                          //console("message pressed, ");
                          item.isRead = true;
                          item.users[0] == route.params.myId ? goToMessages(item.users[1]) : goToMessages(item.users[0])
                        }}
                        >
                          <Text style = {{marginTop: 10}}>
                            {item.lastMessage}
                          </Text>
                        </TouchableOpacity>}
                    />

                  </View>
    */

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APIList
        ref={listRef}
        initialAmount={10}
        additionalAmount={20}
        queryOperationName={"listConversations"}
        queryOperation={listConversations}
        processingFunction={collectConversations}
        renderItem={({ item }) => (
          <FriendListItem
            deleteConversationFromConvo={deleteConversationFromConvo}
            imageURL={item.imageURL}
            // removeFriendHandler={removeFriend}
            item={item}
            // friendId={item.sender === myId ? item.receiver : item.sender}
            friendId={
              item.users[0] == globalThis.myId ? item.users[1] : item.users[0]
            }
            myId={globalThis.myId}
            lastMessage={item.lastMessage}
            lastUser={item.lastUser}
            Accepted={item.Accepted}
            removeFriendHandler={undefined}
            sidebar={undefined}
          />
        )}
        keyExtractor={(item: Conversation) => item.id}
      />
    </SafeAreaView>
  )
}
