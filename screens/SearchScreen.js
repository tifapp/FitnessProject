import { MaterialIcons } from "@expo/vector-icons";
import APIList from "components/APIList";
import ListGroupItem from "components/ListGroupItem";
import UserListItem from "components/UserListItem";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { listGroups, listUsers } from "root/src/graphql/queries";

var styles = require("styles/stylesheet");

function titleCase(str) {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(" ");
}

export default function SearchScreen({ navigation, route }) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("all"); //refreshing tho
  const searchBarRef = useRef();
  const UserListRef = useRef();
  const GroupListRef = useRef();
  const currentQuery = useRef();

  currentQuery.current = query.toLowerCase();

  useEffect(() => {
    if (query !== "") {
      UserListRef.current.fetchDataAsync(true, () => {
        return currentQuery.current !== query.toLowerCase() || query === "";
      });
      GroupListRef.current.fetchDataAsync(true, () => {
        return currentQuery.current !== query.toLowerCase() || query === "";
      });
    } else {
      if (UserListRef && UserListRef.mutateData) UserListRef.mutateData([]);
      if (GroupListRef && GroupListRef.mutateData) GroupListRef.mutateData([]);
    }
  }, [query]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ backgroundColor: "#a9efe0", flex: 1 }}>
        <TouchableOpacity
          style={[
            {
              flexDirection: "row",
              marginTop: 10,
              marginBottom: 10,
            },
          ]}
          onPress={() => {
            searchBarRef.current.focus();
          }}
        >
          <TextInput
            autoFocus={true}
            ref={searchBarRef}
            style={[styles.textInputStyle, { flexGrow: 1 }]}
            placeholder="Search for names or keywords!"
            onChangeText={(text) => {
              setQuery(text.trim());
            }}
            value={query}
            clearButtonMode="always"
          />
          <MaterialIcons
            name="search"
            size={28}
            color="gray"
            style={[{ marginRight: 10 }]}
          />
        </TouchableOpacity>

        {query !== "" ? (
          <View
            style={[
              styles.spacingTop,
              {
                flexDirection: "row",
                justifyContent: "center",
                zIndex: 1,
              },
            ]}
          >
            <Tab
              label={"All"}
              onPress={() => {
                setSearchType("all");
              }}
              isSelected={searchType === "all"}
            />
            <Tab
              label={"Users"}
              onPress={() => {
                setSearchType("user");
              }}
              isSelected={searchType === "user"}
            />
            <Tab
              label={"Groups"}
              onPress={() => {
                setSearchType("group");
              }}
              isSelected={searchType === "group"}
            />
          </View>
        ) : null}
        <APIList
          ref={UserListRef}
          queryOperation={listUsers}
          ListHeaderComponent={
            searchType === "all" && query.length > 0 ? (
              <Text
                style={{
                  marginTop: 15,
                  fontSize: 20,
                  color: "black",
                  alignSelf: "center",
                  marginBottom: 2,
                  marginHorizontal: 6,
                  fontWeight: "bold",
                }}
              >
                Users
              </Text>
            ) : null
          }
          ListEmptyMessage={
            (searchType === "user" || searchType === "all") && query.length > 0
              ? "No matching results"
              : ""
          }
          filter={{
            filter: {
              or: [
                {
                  name: {
                    beginsWith: currentQuery.current,
                  },
                },
                {
                  status: {
                    beginsWith: titleCase(currentQuery.current), //statuses should really be stored as lowercase strings to make this easier, but no time for that rn
                  },
                },
                {
                  name: {
                    contains: " " + currentQuery.current,
                  },
                },
                {
                  bio: {
                    contains: currentQuery.current,
                  },
                },
                {
                  goals: {
                    contains: currentQuery.current,
                  },
                },
              ],
            },
          }}
          ignoreInitialLoad={true}
          initialAmount={10}
          additionalAmount={20}
          processingFunction={(results) =>
            (searchType === "user" || searchType === "all") && query.length > 0
              ? results
              : []
          }
          renderItem={({ item }) => (
            <UserListItem
              item={item}
              matchingname={item.name.startsWith(query)}
            />
          )}
          keyExtractor={(item) => item.id}
          style={{
            backgroundColor: "#a9efe0",
            flex:
              (searchType === "user" || searchType === "all") &&
              query.length > 0 &&
              1,
          }}
        />
        <APIList
          ref={GroupListRef}
          queryOperation={listGroups}
          ListHeaderComponent={
            searchType === "all" && query.length > 0 ? (
              <Text
                style={{
                  marginTop: 15,
                  fontSize: 20,
                  color: "black",
                  alignSelf: "center",
                  marginBottom: 2,
                  marginHorizontal: 6,
                  fontWeight: "bold",
                }}
              >
                Groups
              </Text>
            ) : null
          }
          ListEmptyMessage={
            (searchType === "group" || searchType === "all") && query.length > 0
              ? "No matching results"
              : ""
          }
          filter={{
            filter: {
              or: [
                {
                  name: {
                    beginsWith: currentQuery.current,
                  },
                },
                {
                  name: {
                    contains: " " + currentQuery.current,
                  },
                },
                {
                  Sport: {
                    contains: currentQuery.current,
                  },
                },
                {
                  Description: {
                    contains: currentQuery.current,
                  },
                },
              ],
            },
          }}
          ignoreInitialLoad={true}
          initialAmount={10}
          additionalAmount={20}
          processingFunction={(results) =>
            (searchType === "group" || searchType === "all") && query.length > 0
              ? results
              : []
          }
          renderItem={({ item }) => (
            <ListGroupItem
              item={
                route.params?.updatedGroup == null
                  ? item
                  : route.params?.updatedGroup
              }
              matchingname={item.name.startsWith(query)}
            />
          )}
          keyExtractor={(item) => item.id}
          style={{
            backgroundColor: "#a9efe0",
            flex:
              (searchType === "group" || searchType === "all") &&
              query.length > 0 &&
              1,
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

function Tab({ label, onPress, isSelected }) {
  return (
    <TouchableOpacity
      style={{
        borderBottomWidth: isSelected ? 3 : 0,
        backgroundColor: "transparent",
        padding: 9,
        marginHorizontal: 10,
        marginBottom: isSelected ? 12 : 0,
      }}
      onPress={onPress}
    >
      <Text
        style={{
          color: isSelected ? "black" : "gray",
          alignSelf: "center",
          marginBottom: 2,
          marginHorizontal: 6,
          fontWeight: "bold",
          fontSize: 20,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
