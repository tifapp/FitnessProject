import { APIListOperations } from "@components/APIList";
import PostItem from "@components/PostItem";
import SHA256 from "@hooks/hash";
import FeedScreen from "@screens/FeedScreen";
import React from "react";
import { View } from "react-native";
import { Post } from "src/models";
import ElevatedView from "../common/ElevatedView";
import IconButton from "../common/IconButton";

interface Props {
  item: Post;
  operations: APIListOperations<Post>;
}

export default function CommentsModal({ item, operations }: Props) {
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
        headerComponent={
          <PostItem
            item={item}
            operations={operations}
            //deletePostsAsync={deletePostsAsync}
            writtenByYou={item.userId === globalThis.myId}
            //editButtonHandler={updatePostAsync} deleting a post while on the reply screen?
            //replyButtonHandler={() => {
            //setAreRepliesVisible(false);
            //}}
            isVisible={false}
            shouldSubscribe={true}
            likes={0}
            reportPost={function (
              timestamp: string,
              author: string
            ): Promise<any> {
              throw new Error("Function not implemented.");
            }}
          />
        }
        autoFocus={true}
        channel={SHA256(item.userId + item.createdAt)} //unique id
        originalParentId={item.createdAt + "#" + item.userId}
        footerComponent={undefined}
        isFocused={undefined}
        style={undefined}
        postButtonLabel={undefined}
        renderItem={undefined}
        onPostAdded={undefined}
        data={undefined}
      />
    </>
  );
}
