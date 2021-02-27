import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Text,
  Linking,
} from 'react-native';

import { ProfileImageAndName } from 'components/ProfileImageAndName'
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { listFriendRequests, friendRequestsByReceiver, listFriendships, getFriendship, friendsBySecondUser, batchGetFriendRequests } from "root/src/graphql/queries";
import APIList from 'components/APIList';

const CustomSidebarMenu = ({myId}) => {
  const [friendList, setFriendList] = useState([]);
  const [friendRequestList, setFriendRequestList] = useState([]);

  const friendRequestListRef = useRef();
  const currentFriends = useRef();
  const currentFriendRequests = useRef();

  currentFriends.current = friendList;
  currentFriendRequests.current = friendRequestList;

  const goToMessages = (item) => {
    navigation.navigate("Messages", { userId: item });
  };

  useEffect(() => {
    waitForNewFriendsAsync();
  }, []);

  const waitForNewFriendsAsync = async () => {
    await API.graphql(graphqlOperation(onCreateFriendship)).subscribe({
      next: (event) => {
        const newFriend = event.value.data.onCreateFriendship;
        if (
          newFriend.user1 == myId ||
          newFriend.user2 == myId
        ) {
          setFriendList([newFriend, ...currentFriends.current]);
        }
      },
    });
    /*
        await API.graphql(graphqlOperation(onCreateFriendRequest)).subscribe({
            next: event => {
                const newFriendRequest = event.value.data.onCreateFriendRequest
                if (newFriendRequest.receiver == myId) {
                    setFriendRequestList([newFriendRequest, ...currentFriendRequests.current]);
                }
            }
        });
        */
  };

  const findFriendID = (item) => {
    if (myId == item.user1) return item.user2;
    if (myId == item.user2) return item.user1;
  };

  const removeFriendHandler = (item) => {
    const title = "Are you sure you want to remove this friend?";
    const options = [
      { text: "Yes", onPress: () => removeFriend(item) },
      { text: "Cancel", type: "cancel" },
    ];
    Alert.alert(title, "", options, { cancelable: true });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/*Top Large Image */}
      <ProfileImageAndName
        you={true}
        navigation={false}
        vertical={true}
        style={styles.imageStyle}
        userId={myId}
        isFull={true}
        fullname={true}
      />
      <Text
        style={{
          fontSize: 16,
          textAlign: "center",
          color: "grey",
        }}
      >
        Friends
      </Text>
      <APIList
        queryOperation={listFriendships}
        filter={{
          filter: {
            or: [
              {
                user1: {
                  eq: myId,
                },
              },
              {
                user2: {
                  eq: myId,
                },
              },
            ],
          },
        }}
        setDataFunction={setFriendList}
        data={friendList}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 5,
              justifyContent: "space-between",
              width: "80%",
            }}
          >
            <ProfileImageAndName
              style={styles.smallImageStyle}
              userId={findFriendID(item)}
            />
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 15,
              }}
              onPress={() => removeFriendHandler(item)}
            >
              <Text>Remove</Text>
              <Entypo
                name="cross"
                style={{ marginHorizontal: 7 }}
                size={44}
                color="red"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unselectedButtonStyle, { borderColor: "blue" }]}
              color="orange"
              onPress={() => goToProfile(findFriendID(item))}
            >
              <Text
                style={[styles.unselectedButtonTextStyle, { color: "blue" }]}
              >
                Message
              </Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.createdAt.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sideMenuProfileIcon: {
    resizeMode: "center",
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    alignSelf: "center",
  },
  iconStyle: {
    width: 15,
    height: 15,
    marginHorizontal: 5,
  },
  customItem: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CustomSidebarMenu;