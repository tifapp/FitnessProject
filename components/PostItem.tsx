import API, { graphqlOperation } from "@aws-amplify/api";
import { APIListOperations } from "@components/APIList";
import { deletePost, updatePost } from "@graphql/mutations";
import React, { useRef, useState } from "react";
import { Alert, Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Post } from "src/models";
import IconButton from "./common/IconButton";
import Modal, { ModalRefType } from "./common/Modal";
import CommentsModal from "./postComponents/CommentsModal";
import LikesModal from "./postComponents/LikesModal";
import PostHeader from "./postComponents/PostHeader";
import PostImage from "./PostImage";
import { ProfileImageAndName } from "./ProfileImageAndName";
import TextWithTaggedUsers from "./TextWithTaggedUsers";
import printTime from "@hooks/printTime";


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
  item: Post & {taggedUsers?: string[]; likedByYou?: boolean},
  likes: number,
  reportPost: (timestamp: string, author: string) => Promise<any>,
  replyButtonHandler?: () => void,
  writtenByYou: boolean,
  isVisible?: boolean,
  shouldSubscribe?: boolean,
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
        <View
          style={{
            //borderColor: "red",
            //borderWidth: 2,
            flex: 1,
            flexDirection: 'row'
          }}
        >
          <View
            style={{
              //borderColor: "yellow",
             // borderWidth: 2,
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-start'
            }}>
              <ProfileImageAndName
                textStyle={{
                  fontWeight: writtenByYou ? "bold" : "normal",
                }}
                style={{
                  //borderColor: "purple",
                  //borderWidth: 2,
                }}
                userId={item.userId}
              />
          </View>
          <Text
            style={{
              //borderColor: "orange",
             // borderWidth: 2,
              flex: 1,
              flexDirection: 'row',
              alignSelf: 'center',
              textAlign: 'right'
            }}
          >distance</Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderColor: "pink",
            borderWidth: 2,
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
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            //justifyContent: "flex-start",
            borderColor: "red",
            borderWidth: 2,
            minHeight: 20,
          }}
        >
          <View
            style={{
              flex: 0.5,
              flexDirection: "row",
              justifyContent: "space-between",
              borderColor: "yellow",
              borderWidth: 2,
             // minHeight: writtenByYou ? 70 : 35,
            }}
          >
            <IconButton 
              iconName={"query-builder"}
              size={20}
              color={"black"}
              onPress={() => null}
            />
            <Text  
            >
                4hrs</Text>
            <IconButton
              style={{
                paddingHorizontal: 5
              }}
              iconName={"lens"}
              size={5}
              color={"black"}
              onPress={() => null}
            />
            <IconButton 
              iconName={"person-outline"}
              size={20}
              color={"black"}
              onPress={() => null}
            />
            <Text>1/10</Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
              borderColor: "purple",
              borderWidth: 2,
             // minHeight: writtenByYou ? 70 : 35,
            }}
          >
            <Text style={{paddingRight: 3}}>5</Text>
            <IconButton
              style={{paddingLeft: 10}}
              iconName={"person-add"}
              size={20}
              color={"black"}
              onPress={() => null}
            />
            <Text style={{paddingRight: 3}}>5</Text>
            <IconButton
              style={{paddingLeft: 8}}
              iconName={"messenger"}
              size={16}
              color={"black"}
              onPress={() => null/*repliesModalRef.current?.showModal()*/}
            />
            <IconButton
              iconName={"more-vert"}
              size={20}
              color={"black"}
              onPress={() => null}
            />
            <Modal ref={repliesModalRef}>
              <CommentsModal item={item} operations={operations}/>
            </Modal>
          </View>

        </View>
      </View>
    </View>
  );
};

export default React.memo(PostItem);

const styles = StyleSheet.create({
  secondaryContainerStyle: {
    backgroundColor: "#a9efe0",
    borderWidth: 2,
    borderColor: "blue"
  },
  spaceAround: {
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    borderWidth: 2,
    borderColor: "green",
    flex: 1,
    flexDirection: 'column'
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
