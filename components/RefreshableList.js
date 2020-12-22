import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { createGroup } from "../src/graphql/mutations";
import {
  StyleSheet,
  Text,
  Button,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Linking,
  ScrollView,
  Keyboard,
  Modal,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import { Amplify, API, graphqlOperation, Auth } from "aws-amplify";
import awsconfig from "../aws-exports"; // if you are using Amplify CLI

const initialAmount = 10;
const additionalAmount = 5;

export default function RefreshablePaginatedSubscribedAWSList(props) {
  const [amountShown, setAmountShown] = useState(initialAmount);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextToken, setNextToken] = useState(null); //for pagination
  const [data, setData] = useState([]);
  
  const isMounted = useRef(); //this variable exists to eliminate the "updated state on an unmounted component" warning

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setAmountShown(initialAmount);
    showDataAsync()
      .then(() => { setRefreshing(false) })
      .catch();
  }, []);
  
  useEffect(() => {
    isMounted.current = true;
    showDataAsync();
    return () => {isMounted.current = false;}
  }, []);

  const showDataAsync = async () => {
    //do not refetch if the user themselves added or updated a post
    //if new posts are being added don't refetch the entire batch, only append the new posts
    //if a post is being updated don't refetch the entire batch, only update that post
    //if a lot of new posts are being added dont save all of them, paginate them at like 100 posts

    try {
      if (nextToken == null) {
        const query = await API.graphql(graphqlOperation(props.queryFunction, { limit: amountShown, nextToken: null, ...props.queryIdentifier, sortDirection: 'DESC' }));
        
        setData(query.data[Object.keys(query.data)[0]].items);
        setNextToken(query.data[Object.keys(query.data)[0]].items);
      } else {
        setLoadingMore(true);
        const query = await API.graphql(graphqlOperation(props.queryFunction, { limit: additionalAmount, nextToken: nextToken, ...props.queryIdentifier, sortDirection: 'DESC' }));

        if (isMounted.current) {
          setData([...data, ...query.data[Object.keys(query.data)[0]].items]);
          setAmountShown(amountShown + additionalAmount);
          setNextToken(query.data[Object.keys(query.data)[0]].nextToken);
        }
        setLoadingMore(false);
      }
      //console.log('showing these posts: ', query);
    } catch (err) {
      console.log("error in loading data: ", err);
    }
  };

  return (
    <View>
      <FlatList
        data={props.data}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={props.renderItem}
        keyExtractor={props.keyExtractor}
        onEndReached={showDataAsync}
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
  );
}

const styles = StyleSheet.create({
  nameFormat: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    paddingTop: 30,
    paddingBottom: 15,
  },
});
