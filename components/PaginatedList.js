import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from "react-native";

var styles = require("../styles/stylesheet");

export default function PaginatedList(props) {
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextToken, setNextToken] = useState(null); //for pagination
  const [debounce, setDebounce] = useState(false);

  const loadMore = () => {
    if (!debounce && nextToken != null) { //if we don't check this, the list will repeat endlessly
      setDebounce(true);
      setLoadingMore(true);
      props.showDataFunction(nextToken, setNextToken)
        .finally(() => { setLoadingMore(false); setDebounce(false); });
    }
  }
  
  useEffect(() => {
    props.showDataFunction(nextToken, setNextToken);
  }, []);

  return (
    <View>
      <FlatList
        data={props.data}
        refreshControl={props.refreshControl}
        renderItem={props.renderItem}
        keyExtractor={props.keyExtractor}
        onEndReached={loadMore}
        onEndReachedThreshold={1}
      />

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
              bottom: 20
            }} />
          : null
      }
    </View>
  )
}
