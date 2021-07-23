import React, {
  useState,
  useEffect,
  useRef
} from "react";
import {
  Text,
  View,
  TouchableOpacity,
  PureComponent,
  SafeAreaView,
  LayoutAnimation
} from "react-native";
import { conversationsByLastUpdated, listConversations, getConversations } from "../src/graphql/queries";
import { deleteConversation } from "root/src/graphql/mutations";
import {
  onCreatePostForReceiver,
  onCreatePostByUser,
  onDeleteConversation
} from "root/src/graphql/subscriptions";
import APIList from "../components/APIList"
import { API, graphqlOperation } from "aws-amplify";
import { ProfileImageAndName } from "../components/ProfileImageAndName"
import FriendListItem from "components/FriendListItem"
//import { listConversations } from "../amplify/#current-cloud-backend/function/backendResources/opt/queries";

var styles = require('styles/stylesheet');
var subscriptions = [];

export default function ConversationScreen({ navigation, route }) {

  const updateConversationList = async (newPost) => {

    let tempConversations = currentConversations.current;

    tempConversations.filter(item => newPost.channel === item.channel);

    let newConversation = null;

    if (tempConversations.length == 0) {
      newConversation = await API.graphql(graphqlOperation(getConversations, { Accepted: 1, limit: 1 }));
    }

    if (newPost.channel == newConversation.data.channel) {
      const conversation = { id: newPost.channel, users: [newPost.userId, newPost.receiver], lastUser: newPost.userId, lastMessage: newPost.description, Accepted: 1 }

      //console.log("++++++++++++++++++++++++++++++++")
      //console.log(conversation);
      //console.log("++++++++++++++++++++++++++++++++")

      let tempConversations = currentConversations.current;

      let index = tempConversations.findIndex(item => newPost.channel === item.id);

      if (index != -1) {
        tempConversations.splice(index, 1); //removes 1 item from the current Conversations at the specified index
      }

      tempConversations.unshift(conversation);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      //setConversations([conversation, ...currentConversations.current]);
      setConversations([...tempConversations]);
    }
  }

  useEffect(() => {

    // Executes when a user receieves a friend request
    // listening for new friend requests

    const receivedConversationSubscription = API.graphql(
      graphqlOperation(onCreatePostForReceiver, { receiver: route.params.myId })
    ).subscribe({
      next: (event) => {
        const newPost = event.value.data.onCreatePostForReceiver;
        global.addConversationIds(newPost.userId);
        global.showNotificationDot();
        updateConversationList(newPost);
      },
    });

    const sentConversationSubscription = API.graphql(
      graphqlOperation(onCreatePostByUser, { userId: route.params.myId })
    ).subscribe({
      next: (event) => {
        const newPost = event.value.data.onCreatePostByUser;

        updateConversationList(newPost);
      },
    });


    return () => {
      receivedConversationSubscription.unsubscribe()
      sentConversationSubscription.unsubscribe()
      subscriptions.forEach(element => {
        element.unsubscribe();
      });
    };
  }, []);

  const [conversations, setConversations] = useState([]);
  const currentConversations = useRef();
  currentConversations.current = conversations;

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

    setConversations((conversations) => {
      return conversations.filter(
        (i) => i.users[0] !== friendID || i.users[1] !== friendID
      );
    });


    await API.graphql(
      graphqlOperation(deleteConversation, {
        input: { id: item.id }
      })
    );

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
      console.log("error: ", err);
    }
    */
  };

  useEffect(() => {
    console.log("Inside delete Conversation Subscription");
    for (let i = 0; i < conversations.length; i++) {
      (async () => {
        subscriptions.push(
          await API.graphql(
            graphqlOperation(onDeleteConversation, { users: conversations[i].users })
          ).subscribe({
            next: (event) => {
              const conversation = event.value.data.onDeleteConversation;
              const filteredConversations = conversations.filter((convo) =>
                convo.id != conversation.id
              );
              setConversations(filteredConversations);
            },
          })
        )
      })();
    }
  });

  useEffect(() => {
    for (let i = 0; i < conversations.length; i++) {
      console.log(route.params.myId)
      console.log(conversations[i])
    }
  }, [conversations])

  const goToMessages = (id) => {
    if (!navigation.push)
      navigation.navigate(id);
    else navigation.push(id);
  };

  const collectConversations = (items) => {
    //what if conversations array shrinks? we should remove from the conversationids array

    console.log("1. Inside collect Conversations");
    console.log(items);

    items.forEach((element) => {
      let userId = null;
      if (element.users[0] != route.params.myId) {
        userId = element.users[0];
      }
      else {
        userId = element.users[1];
      }
      global.addConversationIds(userId);
    });
    return items;
  };

  /*
    <View style= {[styles.containerStyle, {marginVertical: 5}]}>
                    
                    <ProfileImageAndName
                      imageStyle={[styles.smallImageStyle, { marginHorizontal: 20 }]}
                      userId={ item.users[0] == route.params.myId ? item.users[1] : item.users[0]}
                      subtitleComponent = {<TouchableOpacity
                        onPress={() => {
                          console.log("message pressed, ");
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
        initialAmount={10}
        additionalAmount={20}
        queryOperation={getConversations}
        data={conversations}
        setDataFunction={setConversations}
        //processingFunction={collectConversations}
        renderItem={({ item }) => (
          <FriendListItem
            navigation={navigation}
            deleteConversationFromConvo={deleteConversationFromConvo}
            //removeFriendHandler={removeFriend}
            item={item}
            //friendId={item.sender === myId ? item.receiver : item.sender}
            friendId={item.users[0] == route.params.myId ? item.users[1] : item.users[0]}
            myId={route.params.myId}
            lastMessage={item.lastMessage}
            lastUser={item.lastUser}
          />
        )}
        filter={{ Accepted: 1 }}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};