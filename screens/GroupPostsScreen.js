import { AntDesign } from "@expo/vector-icons";
// Get the aws resources configuration parameters
import FeedScreen from "@screens/FeedScreen";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

//const { width } = Dimensions.get('window');

// @ts-ignore
var styles = require("styles/stylesheet");

export default function GroupPostsScreen({ navigation, route }) {
  const { group } = route.params;
  //console.log(route.params);
  //console.log(route);
  const goEditGroupScreen = () => {
    navigation.navigate("Create Group", { group: group, check: true });
  };

  useEffect(() => {
    navigation.setOptions({ title: group.name });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#a9efe0" }}>
      {route.params.myId == group.userID ? (
        <TouchableOpacity onPress={goEditGroupScreen}>
          <AntDesign
            style={{ alignSelf: "flex-end", marginTop: 10, marginRight: 15 }}
            name="edit"
            size={30}
            color="black"
          />
        </TouchableOpacity>
      ) : null}

      <Text style={{ alignSelf: "center" }}>"{group.Description}"</Text>

      <FeedScreen
        navigation={navigation}
        route={route}
        channel={group.id}
        receiver={undefined}
        headerComponent={undefined}
        footerComponent={undefined}
        originalParentId={undefined}
        Accepted={undefined}
        lastUser={undefined}
        sidebar={undefined}
        id={undefined}
        isFocused={undefined}
      />
    </View>
  );
}
