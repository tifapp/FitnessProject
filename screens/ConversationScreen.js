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
import { listConversations } from "../src/graphql/queries";
import {
  onCreatePost
} from "root/src/graphql/subscriptions";
import APIList from "../components/APIList"
import { API, graphqlOperation} from "aws-amplify";
import {ProfileImageAndName} from "../components/ProfileImageAndName"
import FriendListItem from "components/FriendListItem"

var styles = require('styles/stylesheet');

export default function ConversationScreen({ navigation, route }) {

  useEffect(() => {

    // Executes when a user receieves a friend request
    // listening for new friend requests

    const conversationSubscription = API.graphql(
      graphqlOperation(onCreatePost)
    ).subscribe({
      next: (event) => {
        const newPost = event.value.data.onCreatePost;
        
        console.log("########################################")
        console.log("########################################")
        console.log("########################################")
        console.log("########################################")
        console.log("########################################")
        console.log("newPost " + newPost.userId);
        console.log("########################################")
        console.log("########################################")
        console.log("########################################")
        console.log("########################################")
        console.log("########################################")

        //conversation already exists
        
        /*
        let conversation = currentConversations.current.find((item) => {
          //const time = timestamp.toString();
          return newPost.channel === item.id;
        })
        */

        console.log("Checking");
        
        if(newPost.receiver == route.params.myId || (newPost.userId == route.params.myId && newPost.receiver != null)){
          console.log("Testing");
          //conversation = {id: newPost.channel, users: newPost.userId, lastUser: newPost.userId,  lastMessage: newPost.description}
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
        

        /*
        //we can see all friend requests being accepted, so we just have to make sure it's one of ours.
        if(conversation == null){
          conversation = {id: newPost.channel, users: newPost.userId, lastMessage: newPost.description}
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setConversations([conversation, ...currentConversations.current]);
        }
        else{
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          let index = currentConversations.current.findIndex(item => newPost.channel === item.id)

          console.log("------------------------------------------")
          console.log(index)
          console.log("------------------------------------------")

          //var index = currentConversations.current.indexOf(currentConversations.current[currentConversations.current.findIndex(item => newPost.channel === item.id)]);
          console.log("index: " + index);

          let tempConversations =  currentConversations.current;

          tempConversations.splice(index, 1); //removes 1 item from the current Conversations at the specified index
          //currentConversations.current.splice(0, 0, conversation); // adds the conversation at index 0    
          //currentConversations.current.unshift(conversation);
          tempConversations.unshift(conversation);
          setConversations([...tempConversations]);

          //let cutOut = currentConversations.current.splice(index, 1) [0]; // cut the element at index 'from'
          //conversations.splice(0, 0, cutOut);            // insert it at index 'to'
          //currentConversations.current.splice(0, 0, cutOut)

          console.log("*****************************************")
          console.log(currentConversations.current)
          console.log("*****************************************")

          //tempposts.splice(index + 1, 0, newPost); 
        }
        */
      },
    });

    /*
    const removedFriendSubscription = API.graphql(
      graphqlOperation(onDeleteFriendship)
    ).subscribe({
      next: (event) => {
        const deletedFriend = event.value.data.onDeleteFriendship; //check the security on this one. if possible, should only fire for the sender or receiver.
        console.log("friend deleted ", deletedFriend);
        if (currentFriends.current.find(item => item.sender === deletedFriend.sender && item.sender === deletedFriend.sender)) {
          var index = currentFriends.current.findIndex(item => item.sender === deletedFriend.sender && item.sender === deletedFriend.sender);
          currentFriends.current.splice(index, 1);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setFriendList(currentFriends.current);
        }
      },
    });
    */

    return () => {
      conversationSubscription.unsubscribe()
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
              queryOperation={listConversations}
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
              keyExtractor={(item) => item.id}
            />
          </SafeAreaView>
  );
};