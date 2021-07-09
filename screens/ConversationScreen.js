import React, { useState, 
  useEffect, 
  useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  PureComponent,
  SafeAreaView,
  LayoutAnimation
} from "react-native";
import { conversationsByLastUpdated } from "../src/graphql/queries";
import {
  onCreatePostForReceiver,
  onCreatePostByUser
} from "root/src/graphql/subscriptions";
import APIList from "../components/APIList"
import { API, graphqlOperation} from "aws-amplify";
import {ProfileImageAndName} from "../components/ProfileImageAndName"
import FriendListItem from "components/FriendListItem"

var styles = require('styles/stylesheet');

export default function ConversationScreen({ navigation, route }) {

  const updateConversationList = (newPost) => {
    const conversation = {id: newPost.channel, users: [newPost.userId, newPost.receiver], lastUser: newPost.userId, lastMessage: newPost.description}

    console.log("++++++++++++++++++++++++++++++++")
    console.log(conversation);
    console.log("++++++++++++++++++++++++++++++++")

    let tempConversations =  currentConversations.current;

    let index = tempConversations.findIndex(item => newPost.channel === item.id);

    // Testing for new conversations being created
    console.log("|||||||||||||||||||||||");
    console.log(index);
    console.log("|||||||||||||||||||||||");

    console.log("================================");
    console.log(tempConversations);
    console.log("================================");

    if(index != -1){
      tempConversations.splice(index, 1); //removes 1 item from the current Conversations at the specified index
    }
      
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    console.log(tempConversations);
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");

    tempConversations.unshift(conversation);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    //setConversations([conversation, ...currentConversations.current]);
    setConversations([...tempConversations]);
  }

  useEffect(() => {

    // Executes when a user receieves a friend request
    // listening for new friend requests

    const receivedConversationSubscription = API.graphql(
      graphqlOperation(onCreatePostForReceiver, {receiver: route.params.myId})
    ).subscribe({
      next: (event) => {
        const newPost = event.value.data.onCreatePostForReceiver;

        global.showNotificationDot();
        updateConversationList(newPost);
      },
    });
    
    const sentConversationSubscription = API.graphql(
      graphqlOperation(onCreatePostByUser, {userId: route.params.myId})
    ).subscribe({
      next: (event) => {
        const newPost = event.value.data.onCreatePostByUser;

        updateConversationList(newPost);
      },
    });

    return () => {
      receivedConversationSubscription.unsubscribe()
      sentConversationSubscription.unsubscribe()
    };
  }, []);

  const [conversations, setConversations] = useState([]);
  const currentConversations = useRef();
  currentConversations.current = conversations;

  useEffect(() => {
    for(let i = 0; i < conversations.length; i++){
      console.log(route.params.myId)
      console.log(conversations[i])
    }
  }, [conversations])
  
  const goToMessages = (id) => {
    if (!navigation.push)
      navigation.navigate(id);
    else navigation.push(id);
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
              queryOperation={conversationsByLastUpdated}
              data={conversations}
              setDataFunction={setConversations}
              renderItem={({ item }) => (
                <FriendListItem
                navigation={navigation}
                //removeFriendHandler={removeFriend}
                item={item}
                //friendId={item.sender === myId ? item.receiver : item.sender}
                friendId={ item.users[0] == route.params.myId ? item.users[1] : item.users[0]}
                myId={route.params.myId}
                lastMessage={item.lastMessage}
                lastUser={item.lastUser}
                />
              )}
              filter={{dummy: 0, sortDirection: "DESC"}}
              keyExtractor={(item) => item.id}
            />
          </SafeAreaView>
  );
};