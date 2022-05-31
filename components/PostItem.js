import APIList from "@components/APIList";
import LinkableText from "@components/LinkableText";
import PostHeader from "@components/postComponents/PostHeader";
import PostImage from "@components/PostImage";
import { likesByPost } from "@graphql/queries";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import IconButton from "./common/IconButton";
import Modal from "./common/Modal";
import CommentsModal from "./postComponents/CommentsModal";
import LikesModal from "./postComponents/LikesModal";
import { ProfileImageAndName } from "./ProfileImageAndName";

export default React.memo(function PostItem({
  item,
  deletePostsAsync,
  writtenByYou,
  editButtonHandler,
  replyButtonHandler,
  receiver,
  showTimestamp,
  newSection,
  reportPost,
  isVisible,
  shouldSubscribe,
  myId,
  likes,
  replies,
  index,
}) {
  const likesModalRef = useRef();
  const repliesModalRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  console.log(item.taggedUsers);

  return (
    <View style={styles.secondaryContainerStyle}>
      <View
        style={[styles.spaceAround, replyButtonHandler ?? styles.nestedReply]}
      >
        <PostHeader
          item={item}
          myId={myId}
          deletePostsAsync={deletePostsAsync}
          writtenByYou={writtenByYou}
          toggleEditing={() => setIsEditing(!isEditing)}
          repliesPressed={() => {
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
          imageID={item.imageURL}
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
            <LinkableText
              style={{
                flex: 1,
              }}
              textStyle={{
                paddingTop: 4,
                paddingBottom: 16,
                marginLeft: 22,
                maxWidth: Dimensions.get("window").width - 90,
              }}
              urlPreview={item.urlPreview}
            >
              {item.description}
            </LinkableText>
          )}

          <View
            style={{ flexDirection: "column", position: "absolute", right: 15 }}
          >
            {!writtenByYou ? (
              <IconButton
                iconName={"report"}
                size={20}
                color={"gray"}
                onPress={() => reportPost(item.createdAt, item.userId)}
              />
            ) : null}

            {writtenByYou ? (
              <IconButton
                style={{ marginBottom: 10 }}
                iconName={"delete-forever"}
                size={20}
                color={"gray"}
                onPress={() => deletePostsAsync(item.createdAt)}
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
              keyExtractor={(item) => item.userId}
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
          <CommentsModal item={item} myId={myId} />
        </Modal>
      </View>

      {isEditing ? (
        editedText === "" ? (
          <TouchableOpacity
            style={styles.unselectedButtonStyle}
            onPress={() => {
              alert("Post is empty!");
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
              editButtonHandler(item.createdAt, editedText),
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
});

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
