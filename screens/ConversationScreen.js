import React, { useState, 
  useEffect, 
  useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  PureComponent
} from "react-native";
import { conversationsByLastUpdated } from "../src/graphql/queries";

var styles = require('styles/stylesheet');

export default function ConversationScreen({ navigation, route }) {

  const [conversations, setConversations] = useState([]);

  return (
    <View style={styles.containerStyle}>
      <View>
          <SafeAreaView style={{ flex: 1 }}>
            <APIList
              initialAmount={10}
              additionalAmount={20}
              horizontal={true}
              queryOperation={conversationsByLastUpdated}
              data={conversations}
              setDataFunction={setConversations}
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

                    <Text>
                      {conversations.users}
                    </Text>

                    <Text>
                      {conversations.lastMessage}
                    </Text>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item}
            />
          </SafeAreaView>
        </View>  
    </View>
  );
};