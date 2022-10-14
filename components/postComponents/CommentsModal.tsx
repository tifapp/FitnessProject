import PostItem from "@components/PostItem";
import SHA256 from "@hooks/hash";
import { useNavigation } from "@react-navigation/native";
import FeedScreen from "@screens/FeedScreen";
import React from "react";
import { View } from "react-native";
import ElevatedView from "../common/ElevatedView";
import IconButton from "../common/IconButton";

interface Props {
  item: {userId: string, createdAt: string}
}

export default function CommentsModal({ item } : Props) {
  const navigation = useNavigation();
  return (
    <>
      <ElevatedView
        style={{
          position: "absolute",
          top: -18,
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            backgroundColor: "blue",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <IconButton
            style={{
              backgroundColor: "blue",
              flexDirection: "row",
              alignItems: "center",
            }}
            size={17}
            color="white"
            iconName="chat-bubble"
            fontWeight="bold"
            label="Replying to"
          />
        </View>
      </ElevatedView>
      <FeedScreen
        headerComponent={<PostItem
          item={item}
          //deletePostsAsync={deletePostsAsync}
          writtenByYou={item.userId === globalThis.myId}
          //editButtonHandler={updatePostAsync} deleting a post while on the reply screen?
          //replyButtonHandler={() => {
          //setAreRepliesVisible(false);
          //}}
          isVisible={false}
          shouldSubscribe={true} />}
        autoFocus={true}
        navigation={navigation}
        channel={SHA256(item.userId + item.createdAt)} //unique id
        originalParentId={item.createdAt + "#" + item.userId} 
        footerComponent={undefined} 
        Accepted={undefined} 
        lastUser={undefined} 
        sidebar={undefined} 
        myId={undefined} 
        id={undefined} 
        isFocused={undefined} 
        style={undefined} 
        postButtonLabel={undefined} 
        renderItem={undefined} 
        onPostAdded={undefined}      
      />
    </>
  );
}
