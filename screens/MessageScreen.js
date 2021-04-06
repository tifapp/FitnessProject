import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  useState, 
  useEffect, 
  useRef, 
  PureComponent
} from "react-native";
// Get the aws resources configuration parameters
import FeedScreen from "screens/FeedScreen";
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { ProfileImageAndName } from "components/ProfileImageAndName";

//const { width } = Dimensions.get('window');

var styles = require('styles/stylesheet');

export default function MessageScreen({ navigation, route }) {
  const { userId } = route.params;

  console.log("Here is the user!");
  console.log(userId);

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
      <FeedScreen
        headerComponent={
          <ProfileImageAndName
            you={userId === route.params?.myId}
            navigation={false}
            vertical={true}
            imageStyle={[styles.imageStyle, {marginVertical: 15}]}
            imageLayoutStyle={{margin: 0}}
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
        receiver={userId}
        channel={route.params?.myId < userId ? route.params?.myId+userId : userId+route.params?.myId}
      />
    </View>
  );
};