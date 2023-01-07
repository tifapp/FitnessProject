import AcceptMessageButtons from "@components/AcceptMessageButtons";
import { ProfileImageAndName } from "@components/ProfileImageAndName";
import {
  createConversation, updateConversation
} from "@graphql/mutations";
import {
  getConversation,
  getFriendship
} from "@graphql/queries";
import { useNavigation, useRoute } from "@react-navigation/native";
// Get the aws resources configuration parameters
import FeedScreen from "@screens/FeedScreen";
import { API, graphqlOperation } from "aws-amplify";
import React, { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

export default function MessageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { lastUser, conversationId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const friendlistarray = [globalThis.myId, conversationId].sort();

    (async () => {
      const convo = await API.graphql(
        graphqlOperation(getConversation, {
          id: friendlistarray[0] + friendlistarray[1],
        })
      );
    })();

    const onFocus = navigation.addListener("focus", () => {
      setIsFocused(true);
    });

    const onBlur = navigation.addListener("blur", () => {
      setIsFocused(false);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    //return onFocus, onBlur;
  }, []);

  //Adding this loading check makes the screen more obtuse/prone to breaking. There should be some global check or subscription that applies to all screens that deletes the user from your local app if they get removed.
  useEffect(() => {
    navigation.setOptions({ title: globalThis.savedUsers[conversationId].name });

  //   (async () => {
  //     let user = await API.graphql(
  //       graphqlOperation(getUser, {
  //         id: conversationId,
  //       })
  //     );
  //     if (user.data?.getUser == null) {
  //       await API.graphql(
  //         graphqlOperation(deleteConversation, {
  //           input: { id: id },
  //         })
  //       );

  //       navigation.goBack();
  //     }

  //     let block = await API.graphql(
  //       graphqlOperation(getBlock, {
  //         userId: conversationId,
  //         blockee: globalThis.myId,
  //       })
  //     );
  //     if (block.data?.getBlock != null) {
  //       setBlocked(true);
  //     }

  //     setIsLoading(false);
  //   })();

  //   try {
  //     let conversationFromUsers = [globalThis.myId, conversationId];
  //     conversationFromUsers.sort();

  //     API.graphql(
  //       graphqlOperation(onDeleteConversation, { users: conversationFromUsers })
  //     ).subscribe({
  //       next: (event) => {
  //         navigation.navigate("Conversations");
  //       },
  //     });
  //   } catch (err) {
  //     console.log("Error in the delete conversation subscription", err);
  //   }
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

  const onPostAdded = useCallback(async (newPost) => {
    newPost.receiver = conversationId;

    if (global.updateFriendsListWithMyNewMessage)
      global.updateFriendsListWithMyNewMessage(newPost);

    const friend1 = await API.graphql(
      graphqlOperation(getFriendship, { sender: globalThis.myId, receiver: conversationId })
    );
    const friend2 = await API.graphql(
      graphqlOperation(getFriendship, { sender: conversationId, receiver: globalThis.myId })
    );

    let checkConversationExists = await API.graphql(
      graphqlOperation(getConversation, { id: newPost.channel })
    );
    checkConversationExists = checkConversationExists.data?.getConversation;

    const friend = friend1 ?? friend2;

    let users = [globalThis.myId, conversationId].sort();

    if (checkConversationExists == null) {
      console.log("convo doesnt exist");
      if (
        friend1.data.getFriendship == null &&
        friend2.data.getFriendship == null
      ) {
        await API.graphql(
          graphqlOperation(createConversation, {
            input: {
              id: newPost.channel,
              users: users,
              lastMessage: newPost.description,
              Accepted: 0,
            },
          })
        );
      } else if (
        friend.data.getFriendship &&
        friend.data.getFriendship.accepted == null
      ) {
        await API.graphql(
          graphqlOperation(createConversation, {
            input: {
              id: newPost.channel,
              users: users,
              lastMessage: newPost.description,
              Accepted: 0,
            },
          })
        );
      } else {
        await API.graphql(
          graphqlOperation(createConversation, {
            input: {
              id: newPost.channel,
              users: users,
              lastMessage: newPost.description,
              Accepted: 1,
            },
          })
        );
      }
    } else if (myId != checkConversationExists.lastUser) {
      await API.graphql(
        graphqlOperation(updateConversation, {
          input: {
            id: newPost.channel,
            lastMessage: newPost.description,
            Accepted: 1,
          },
        })
      );
    } else {
      await API.graphql(
        graphqlOperation(updateConversation, {
          input: { id: newPost.channel, lastMessage: newPost.description },
        })
      );
    }
  }, []);
  
  //have a header with the person's name and profile pic also.

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
      style={{ flex: 1, backgroundColor: "white" }}
    >
        <FeedScreen
          inverted={true}
          style={{ backgroundColor: "#a9efe0" }}
          postButtonLabel={"Send Message"}
          footerComponent={
            <View>
              <ProfileImageAndName
                vertical={true}
                imageStyle={styles.imageStyle}
                userId={conversationId}
                isFullSize={true}
                hideName={true}
              />
              {lastUser != globalThis.myId && lastUser != null && (
                <AcceptMessageButtons
                  navigation={navigation}
                  route={route}
                  id={id}
                  channel={[globalThis.myId, conversationId].sort().join("")}
                  receiver={conversationId}
                />
              )}
            </View>
          }
          //renderItem={MessageItem}
          //receiver={conversationId}
          channel={[globalThis.myId, conversationId].sort().join("")}
          //lastUser={lastUser}
          autoFocus={true}
          isFocused={isFocused}
          onPostAdded={onPostAdded}
        />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  imageStyle: {
    marginVertical: 15,
    alignSelf: "center",
    height: 125,
    width: 125,
  },
});
