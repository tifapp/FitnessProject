import API from "@aws-amplify/api"
import { listPosts} from "@graphql/queries"
import {graphqlOperation } from "aws-amplify"
import React, { useEffect, useRef, useState } from "react"
import { FlatList } from "react-native-gesture-handler"
import EventItem from "@components/EventItem"
import generateColor from "@hooks/generateRandomColor"
import NearbyActivities from "./headerComponents/NearbyActivities"
import { ListRenderItemInfo } from "react-native"
import { Post } from "src/models"

const EventsList = () => {
  const [events, setEvents] = useState([]);

  const testFunction = async () => {
    const test = await API.graphql(
      //graphqlOperation(postsByChannel, {channel: 'general'})
      graphqlOperation(listPosts)
      );
    //console.log(test.data.listPosts.items);
    /*
    // @ts-ignore */
    setEvents(test.data.listPosts.items);
  }
  useEffect(() => {
    testFunction();
  }, []);

  return (
    
      <FlatList
        data={events}
        renderItem={({item}: ListRenderItemInfo<Post>) =>
          <EventItem
            item={item}
            writtenByYou={false}
            startTime={new Date()}
            hasInvitations={true}
            eventColor={generateColor()}
          />
        }
        ListHeaderComponent={<NearbyActivities />}
        stickyHeaderIndices={[0]}
      />
  )
}

export default EventsList
