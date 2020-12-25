import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  RefreshControl,
  FlatList,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { API, graphqlOperation } from "aws-amplify";

var styles = require("../styles/stylesheet");

const initialAmount = 10;
const additionalAmount = 5;

export default function APIList(props) {
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextToken, setNextToken] = useState(null); //for pagination
  const [debounce, setDebounce] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadMore = () => {
    if (!debounce && nextToken != null) { //if we don't check this, the list will repeat endlessly
      setDebounce(true);
      setLoadingMore(true);
      fetchDataAsync()
        .finally(() => { setLoadingMore(false); setDebounce(false); });
    }
  }

  useEffect(() => {
    fetchDataAsync();
    if (props.ref != null) {
      props.ref(this)
    }
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDataAsync()
      .then(() => { setRefreshing(false) })
      .catch();
  }, []);
  
  const fetchDataAsync = async () => {
    //do not refetch if the user themselves added or updated a post
    //if new posts are being added don't refetch the entire batch, only append the new posts
    //if a post is being updated don't refetch the entire batch, only update that post
    //if a lot of new posts are being added dont save all of them, paginate them at like 100 posts
    setLoading(true);
    try {
      const query = await API.graphql(
        graphqlOperation(props.queryOperation, { limit: nextToken == null ? initialAmount : additionalAmount, nextToken: nextToken, sortDirection: props.sortDirection == null ? 'DESC' : props.sortDirection, ...props.filter || {}, })
      );
      //console.log('showing these posts: ', query);

      if (nextToken != null)
        props.setDataFunction([...props.data, ...query.data[Object.keys(query.data)[0]].items]); //wont work with current sectionlist implementation
      else
        props.setDataFunction(query.data[Object.keys(query.data)[0]].items);

      if (setNextToken != null) {
        setNextToken(query.data[Object.keys(query.data)[0]].nextToken);
      }

    } catch (err) {
      console.log("error in displaying data: ", err);
    }
    setLoading(false);
  };

  return (
    <View>
      {
        loading
          ? <ActivityIndicator
            size="large"
            color="#0000ff"
            style={{
              flex: 1,
              justifyContent: "center",
              flexDirection: "row",
              justifyContent: "space-around",
              padding: 10,
            }} />
          :
          props.sections == null
            ? <FlatList
              data={props.data}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={props.renderItem}
              keyExtractor={props.keyExtractor}
              onEndReached={loadMore}
              onEndReachedThreshold={1}
            />
            : <SectionList
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={props.renderItem}
              keyExtractor={props.keyExtractor}
              onEndReached={loadMore}
              onEndReachedThreshold={1}

              sections={props.sections}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={[styles.outlineButtonTextStyle, { marginTop: 15 }]}>{title}</Text>
              )}
              stickySectionHeadersEnabled={true}
            />
      }

      {
        loadingMore
          ?
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 200
            }} />
          : null
      }
    </View>
  )
}
