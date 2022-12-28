import API, { graphqlOperation } from "@aws-amplify/api";
import APIList, { APIListOperations } from "@components/APIList";
import { deletePost, updatePost } from "@graphql/mutations";
import { likesByPost } from "@graphql/queries";
import React, { useRef, useState } from "react";
import { Alert, Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Like, Post } from "src/models";
import IconButton from "./common/IconButton";
import Modal, { ModalRefType } from "./common/Modal";
import CommentsModal from "./postComponents/CommentsModal";
import LikesModal from "./postComponents/LikesModal";
import PostHeader from "./postComponents/PostHeader";
import PostImage from "./PostImage";
import { ProfileImageAndName } from "./ProfileImageAndName";
import TextWithTaggedUsers from "./TextWithTaggedUsers";


const updatePostAWS = async (createdAt: string, editedText: string) => {
  try {
    await API.graphql(
      graphqlOperation(updatePost, {
        input: { createdAt: createdAt, description: editedText },
      })
    );
    console.log("success in updating a post");
  } catch (err) {
    console.warn("error in updating post: ", err);
  }
};

const deletePostAWS = async (createdAt: string) => {
  try {
    await API.graphql(
      graphqlOperation(deletePost, {
        input: { createdAt: createdAt, userId: globalThis.myId },
      })
    );
    console.log("success in deleting a post");
  } catch {
    console.log("error in deleting post: ");
  }
};

interface Props {
  item: Post & {taggedUsers: string[]; loading: boolean; likedByYou: boolean},
  likes: number,
  reportPost: (timestamp: string, author: string) => Promise<any>,
  replyButtonHandler?: () => void,
  writtenByYou: boolean,
  isVisible: boolean,
  shouldSubscribe: boolean,
  operations: APIListOperations<Post>,
}

const PostItem = ({
  item,
  writtenByYou,
  replyButtonHandler,
  //receiver,
  //showTimestamp,
  //newSection,
  reportPost,
  isVisible,
  shouldSubscribe,
  likes,
  //replies,
  //index,
  operations,
} : Props) => {
  const {removeItem, replaceItem} = operations;
  const likesModalRef = useRef<ModalRefType>(null);
  const repliesModalRef = useRef<ModalRefType>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  
  return (
    <View style={styles.secondaryContainerStyle}>
      <View
        style={[styles.spaceAround, replyButtonHandler ? {} : styles.nestedReply]}
      >
        <PostHeader
          item={item}
          writtenByYou={writtenByYou}
          toggleEditing={() => setIsEditing(!isEditing)}
          repliesPressed={() => {
            console.log("Inside the function");
            repliesModalRef.current?.showModal();
          }}
          reportPost={reportPost}
          shouldSubscribe={shouldSubscribe}
        />

        <PostImage
          style={{
            resizeMode: "cover",
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").width,
            alignSelf: "center",
            marginBottom: 15,
          }}
          filename={item.imageURL}
          isVisible={
            isVisible
            // && !areRepliesVisible
          }
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            minHeight: writtenByYou ? 70 : 35,
          }}
        >
          {isEditing ? (
            <TextInput
              style={[styles.check, { borderColor: "orange" }]}
              onChangeText={setEditedText}
              autoFocus={true}
            >
              {item.description}
            </TextInput>
          ) : (
            <TextWithTaggedUsers textInput={item.description} taggedUsers={item.taggedUsers} urlPreview={item.urlPreview}/>
          )}

          <View
            style={{ flexDirection: "column", position: "absolute", right: 15 }}
          >
            {!writtenByYou ? (
              <IconButton
                iconName={"report"}
                size={20}
                color={"gray"}
                onPress={() => {removeItem(), reportPost(item.createdAt, item.userId)}}
              />
            ) : null}

            {writtenByYou ? (
              <IconButton
                style={{ marginBottom: 10 }}
                iconName={"delete-forever"}
                size={20}
                color={"gray"}
                onPress={() => {removeItem(), deletePostAWS(item.createdAt);}}
              />
            ) : null}

            {writtenByYou ? (
              <IconButton
                style={{ marginBottom: 15 }}
                iconName={"edit"}
                size={20}
                color={"gray"}
                onPress={() => setIsEditing(!isEditing)}
              />
            ) : null}
          </View>
        </View>

        {item.loading ?? (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
              marginBottom: 16,
            }}
            onPress={() => {
              likesModalRef.current?.showModal();
            }}
          >
            <APIList
              style={{ margin: 0, padding: 0 }}
              horizontal={true}
              queryOperation={likesByPost}
              queryOperationName={"likesByPost"}
              filter={{
                postId: item.createdAt + "#" + item.userId,
                sortDirection: "DESC",
              }}
              initialAmount={1}
              additionalAmount={0}
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ProfileImageAndName
                    style={{
                      alignContent: "flex-start",
                      alignItems: "center",
                      alignSelf: "flex-end",
                      justifyContent: "flex-start",
                      flexDirection: "row",
                      marginLeft: 15,
                      marginRight: 5,
                    }}
                    imageSize={20}
                    userId={item.userId}
                    onPress={likesModalRef.current?.showModal}
                  />
                  <Text>
                    {likes > 1 ? "and " + (likes - 1) + " others" : ""} liked
                    this post
                  </Text>
                </View>
              )}
              keyExtractor={(item: Like) => item.userId}
            />
          </TouchableOpacity>
        )}

        <FlatList
          data={item.taggedUsers}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ProfileImageAndName
              style={{
                alignContent: "flex-start",
                alignItems: "center",
                alignSelf: "flex-start",
                justifyContent: "flex-start",
                flexDirection: "row",
                marginLeft: 15,
                marginRight: 5,
              }}
              imageSize={20}
              userId={item}
            />
          )}
        />

        <Modal ref={likesModalRef}>
          <LikesModal item={item} />
        </Modal>
        <Modal ref={repliesModalRef}>
          <CommentsModal item={item} operations={operations}/>
        </Modal>
      </View>

      {isEditing ? (
        editedText === "" ? (
          <TouchableOpacity
            style={styles.unselectedButtonStyle}
            onPress={() => {
              Alert.alert("Post is empty!");
            }}
          >
            <Text style={[styles.buttonTextStyle, { color: "gray" }]}>
              {"Edit Post"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              replaceItem({description: editedText}),
              updatePostAWS(item.createdAt, editedText),
              setEditedText(""),
              setIsEditing(false);
            }}
          >
            <Text style={styles.buttonTextStyle}>{"Edit Post"}</Text>
          </TouchableOpacity>
        )
      ) : null}
    </View>
  );
};

export default React.memo(PostItem);

const styles = StyleSheet.create({
  secondaryContainerStyle: {
    backgroundColor: "#a9efe0",
  },
  spaceAround: {
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
  },
  check: {
    padding: 25,
    marginTop: 16,
    borderColor: "#bbb",
    borderWidth: 2,
    borderStyle: "solid",
  },
  unselectedButtonStyle: {
    borderWidth: 2,
    borderColor: "gray",
    alignSelf: "center",
    backgroundColor: "transparent",
    padding: 9,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonTextStyle: {
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
    marginHorizontal: 6,
  },
  buttonStyle: {
    alignSelf: "center",
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  nestedReply: {
    marginBottom: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
});
