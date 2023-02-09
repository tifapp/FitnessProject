import API, { GraphQLSubscription } from "@aws-amplify/api"
import { APIListRefType } from "@components/APIList"
import { onCreatePostFromChannel } from "@graphql/subscriptions"
import { listPosts, postsByChannel } from "@graphql/queries"
import {Auth, graphqlOperation } from "aws-amplify"
import React, { useEffect, useRef, useState } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { Post } from "src/models"
import EventItem from "@components/EventItem"
import generateColor from "@hooks/generateRandomColor"

const ActivitiesScreen = () => {
  const [events, setEvents] = useState([]);

  const testFunction = async () => {
    const test = await API.graphql(
      //graphqlOperation(postsByChannel, {channel: 'general'})
      graphqlOperation(listPosts)
      );
    //console.log(test.data.listPosts.items);
    setEvents(test.data.listPosts.items);
  }
  useEffect(() => {
    testFunction();
  }, []);

  function signOut () {
    const title = "Are you sure you want to sign out?"
    const message = ""
    Alert.alert(
      title,
      message,
      [
        {
          text: "Yes",
          onPress: () => {
            Auth.signOut()
          }
        }, // if submithandler fails user won't know
        { text: "Cancel", style: "cancel" }
      ],
      { cancelable: true }
    )
  }

  return (
    <View>
      <FlatList
        data={events}
        renderItem={({item}) => <EventItem item={item} writtenByYou={item.writtenByYou} hasInvitations={item.hasInvitations} eventColor={generateColor()} />}
      />
    </View>
  )
}

export default ActivitiesScreen
