import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
// Get the aws resources configuration parameters
import FeedScreen from "@screens/FeedScreen";
import { GroupFeedScreenRouteProps } from "@stacks/MainStack";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

//const { width } = Dimensions.get('window');

export default function GroupPostsScreen() {
  const {navigate, setOptions} = useNavigation();
  const { group } = useRoute<GroupFeedScreenRouteProps>().params;
  //console.log(route.params);
  //console.log(route);
  const goEditGroupScreen = () => {
    navigate("Create Group", { group: group, check: true });
  };

  useEffect(() => {
    setOptions({ title: group.name });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#a9efe0" }}>
      {globalThis.myId == group.userID ? (
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
