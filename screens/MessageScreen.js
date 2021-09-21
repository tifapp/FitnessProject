import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  PureComponent
} from "react-native";
// Get the aws resources configuration parameters
import FeedScreen from "screens/FeedScreen";
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { ProfileImageAndName } from "components/ProfileImageAndName";
import { API, graphqlOperation } from "aws-amplify";
import { getBlock } from "../src/graphql/queries";
//const { width } = Dimensions.get('window');

var styles = require('styles/stylesheet');

export default function MessageScreen({ navigation, route }) {
  const { userId } = route.params;
  const { Accepted, lastUser, sidebar, id } = route.params;

  const [blocked, setBlocked] = useState(false);

  //console.log("Here is the user!");
  //console.log(userId);

  useEffect(() => {
    (async () => {
      let block = await API.graphql(
        graphqlOperation(getBlock, {
          userId: userId,
          blockee: route.params?.myId,
        })
      );
      if (block.data.getBlock != null) {
        setBlocked(true);
      }
    })();
  }, [userId])

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
    <View style={styles.containerStyle}>
      {
        blocked ?
          null :
          <FeedScreen
            headerComponent={
              <ProfileImageAndName
                you={userId === route.params?.myId}
                vertical={true}
                imageStyle={[styles.imageStyle, { marginVertical: 15 }]}
                imageLayoutStyle={{ margin: 0 }}
                userId={userId}
                isFull={true}
                hidename={true}
                callback={(info) => {
                  navigation.setOptions({ title: info.name });
                }}
              />
            }
            navigation={navigation}
            route={route}
            Accepted={Accepted}
            receiver={userId}
            channel={route.params?.myId < userId ? route.params?.myId + userId : userId + route.params?.myId}
            lastUser={lastUser}
            sidebar={sidebar}
            id={id}
            autoFocus={true}
          />
      }
    </View>
  );
};