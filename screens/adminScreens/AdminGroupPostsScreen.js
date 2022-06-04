import APIList from "@components/APIList";
import PostItem from "@components/PostItem";
import { ProfileImageAndName } from "@components/ProfileImageAndName";
import { updateChallenge } from "@graphql/mutations";
import { postsByLikes } from "@graphql/queries";
import { useNavigation } from "@react-navigation/native";
import { API, graphqlOperation } from "aws-amplify";
import { default as React } from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

//const { width } = Dimensions.get('window');

export default function GroupPostsScreen({ navigation, route }) {
  const { group } = route.params;
  //console.log(route.params);
  //console.log(route);
  const { goBack } = useNavigation();


  return (
    <APIList
      style={[{ flex: 1 }]}
      headerComponent={
        <View>
          <ProfileImageAndName userId={route.params?.winner} />
        </View>
      }
      initialAmount={7}
      additionalAmount={7} //change number based on device specs
      queryOperation={postsByLikes}
      filter={{ channel: route.params?.channel, sortDirection: "DESC" }}
      keyExtractor={(item) => item.createdAt.toString() + item.userId}
      onEndReachedThreshold={0.5}
      renderItem={(item, index) => (
        <>
          <PostItem
            index={index}
            item={item}
            likes={item.likes}
            replies={item.replies}
            writtenByYou={false}
            myId={route.params?.myId}
            newSection={true}
          />
          <TouchableOpacity
            onPress={async () => {
              try {
                await API.graphql(
                  graphqlOperation(updateChallenge, {
                    input: { id: route.params?.channel, winner: item.userId },
                  })
                );
                console.log("success in updating a challenge");
                goBack();
              } catch (err) {
                console.log("error in updating challenge: ", err);
              }
            }}
          >
            <Text>Set winner</Text>
          </TouchableOpacity>
        </>
      )}
    />
  );
}
