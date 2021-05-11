import React, { useState, 
  useEffect, 
  useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  PureComponent,
  SafeAreaView,
} from "react-native";
import { listConversations } from "../src/graphql/queries";
import APIList from "../components/APIList"
import {ProfileImageAndName} from "../components/ProfileImageAndName"

var styles = require('styles/stylesheet');

export default function ConversationScreen({ navigation, route }) {

  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    for(let i = 0; i < conversations.length; i++){
      console.log(route.params.myId)
      console.log(conversations[i])
    }
  }, [conversations])

  const goToMessages = (id) => {
      navigation.navigate("Messages", { userId: id });
  };

  return (
          <SafeAreaView style={{ flex: 1 }}>
            <APIList
              initialAmount={10}
              additionalAmount={20}
              queryOperation={listConversations}
              data={conversations}
              setDataFunction={setConversations}
              renderItem={({ item }) => (
                
                <View style= {[styles.containerStyle, {marginVertical: 5}]}>
                  <ProfileImageAndName
                    imageStyle={[styles.smallImageStyle, { marginHorizontal: 20 }]}
                    userId={ item.users[0] == route.params.myId ? item.users[1] : item.users[0]}
                  />
                  <TouchableOpacity
                  onPress={() => {
                    console.log("message pressed, ");
                    item.isRead = true;
                    item.users[0] == route.params.myId ? goToMessages(item.users[1]) : goToMessages(item.users[0]) 
                  }}
                  >
                    <Text style = {{marginHorizontal: 115, marginBottom: 10}} >
                      {item.lastMessage}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </SafeAreaView>
  );
};