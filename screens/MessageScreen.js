import { API, graphqlOperation } from "aws-amplify";
import { ProfileImageAndName } from "components/ProfileImageAndName";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, View } from "react-native";
import { onDeleteConversation } from "root/src/graphql/subscriptions";
// Get the aws resources configuration parameters
import FeedScreen from "screens/FeedScreen";
import AcceptMessageButtons from "../components/AcceptMessageButtons";
import { getBlock, getConversation, getUser } from "../src/graphql/queries";
//const { width } = Dimensions.get('window');

var styles = require("styles/stylesheet");

export default function MessageScreen({ navigation, route }) {
  //console.log(red);
  const { userId } = route.params;
  const { lastUser, id } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  const [isFocused, setIsFocused] = useState(false);

  //console.log("Here is the user!");
  //console.log(userId);

  useEffect(() => {
    const friendlistarray = [route.params?.myId, userId].sort();

    (async () => {
      const convo = await API.graphql(
        graphqlOperation(getConversation, {
          id: friendlistarray[0] + friendlistarray[1],
        })
      );
    })();

    const onFocus = navigation.addListener("focus", () => {
      //console.log("got to settings", global.localBlockList);
      setIsFocused(true);
    });

    const onBlur = navigation.addListener("blur", () => {
      //console.log("got to settings", global.localBlockList);
      setIsFocused(false);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return onFocus, onBlur;
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: global.savedUsers[userId].name });

    (async () => {
      let user = await API.graphql(
        graphqlOperation(getUser, {
          id: userId,
        })
      );
      if (user.data.getUser == null) {
        await API.graphql(
          graphqlOperation(deleteConversation, {
            input: { id: id },
          })
        );

        navigation.goBack();
      }

      let block = await API.graphql(
        graphqlOperation(getBlock, {
          userId: userId,
          blockee: route.params?.myId,
        })
      );
      if (block.data.getBlock != null) {
        setBlocked(true);
      }

      setIsLoading(false);
    })();

    try {
      let conversationFromUsers = [route.params?.myId, userId];
      conversationFromUsers.sort();

      API.graphql(
        graphqlOperation(onDeleteConversation, { users: conversationFromUsers })
      ).subscribe({
        next: (event) => {
          navigation.navigate("Conversations");
        },
      });
    } catch (err) {
      console.log("Error in the delete conversation subscription", err);
    }
  }, []);

  /*
  useEffect(() => {
    API.graphql(graphqlOperation(createReadReceipt, { input: {id: channel} })); //don't do this if there are no new messages
  },[]);

  /*
  useFocusEffect(
    React.useCallback(() => {
      console.log("Testing"), 
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          console.log("Incoming notification looks like ", notification),
          notification.request.content.subtitle.includes("message")
          ?{
            shouldShowAlert: false,
            shouldPlaySound: true,
            shouldSetBadge: false
          }
          : {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true
          }

          return(() => {
            Notifications.setNotificationHandler({
              handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true
              })
            })
          });
        },
      });
    }, [])
  );
  */

  //console.log(route.params);
  //console.log(route);
  //have a header with the person's name and profile pic also.
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      {!isLoading && !blocked && (
        <FeedScreen
          footerComponent={
            <View>
              <ProfileImageAndName
                vertical={true}
                imageStyle={[styles.imageStyle, { marginVertical: 15 }]}
                imageLayoutStyle={{ margin: 0 }}
                userId={userId}
                navigateToProfile={false}
                isFullSize={true}
                hidename={true}
              />
              {lastUser != route.params.myId && lastUser != null && (
                <AcceptMessageButtons
                  navigation={navigation}
                  route={route}
                  id={id}
                  channel={[route.params?.myId, userId].sort().join("")}
                  receiver={userId}
                />
              )}
            </View>
          }
          navigation={navigation}
          route={route}
          receiver={userId}
          channel={[route.params?.myId, userId].sort().join("")}
          lastUser={lastUser}
          autoFocus={true}
          isFocused={isFocused}
        />
      )}
    </KeyboardAvoidingView>
  );
}
