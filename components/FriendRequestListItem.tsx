import { MaterialIcons } from "@expo/vector-icons"
import playSound from "@hooks/playSound"
import React, { useState } from "react"
import { Alert, View } from "react-native"
import { Friendship } from "src/models"
import { APIListOperations } from "./APIList"
import IconButton from "./common/IconButton"
import { ProfileImageAndName } from "./ProfileImageAndName"

interface Props {
  item: Friendship;
  operations: APIListOperations<Friendship>;
  confirmResponseHandler: (item: Friendship, isNew?: boolean) => Promise<void>;
  isNew: boolean;
}

export default function FriendRequestListItem ({
  item,
  operations,
  confirmResponseHandler,
  isNew
}: Props) {
  const { replaceItem, removeItem } = operations
  const [isSelected, setIsSelected] = useState(false)

  const alertOptions = {
    cancelable: true,
    onDismiss: () => setIsSelected(false)
  }

  const openOptionsDialog = () => {
    const title = "More Options"
    const message = ""
    const options = [
      {
        text: "Block", // should appear as options, maybe as part of profileimageandname component
        onPress: () => {
          const title =
            "Are you sure you want to block this friend? This will unfriend them and stop them from sending you messages and friend requests."
          const options = [
            {
              text: "Yes",
              onPress: () => {
                removeItem()
                confirmResponseHandler(item, isNew)
              }
            },
            {
              text: "Cancel",
              type: "cancel"
            }
          ]
          Alert.alert(title, "", options, alertOptions)
        }
      }, // if submithandler fails user won't know
      {
        text: "Cancel",
        type: "cancel",
        onPress: () => {
          setIsSelected(false)
        }
      }
    ]
    Alert.alert(title, message, options, alertOptions)
    setIsSelected(true)
  }

  return (
    <View style={{}}>
      <View
        style={[
          { flexDirection: "row", alignItems: "flex-start" },
          isSelected && { backgroundColor: "orange" }
        ]}
      >
        <IconButton
          iconName={"more-vert"}
          size={20}
          color={isSelected ? "black" : "gray"}
          onPress={openOptionsDialog}
          style={{ alignSelf: "center", paddingHorizontal: 8 }}
        />
        <ProfileImageAndName
          style={{ flex: 1, marginVertical: 15 }}
          userId={item.sender}
          textStyle={{
            fontWeight: "normal",
            fontSize: 15,
            color:
            item.accepted != null
              ? "gray"
              : isNew
                ? "blue"
                : "black"
          }}
          textLayoutStyle={{ flex: 1, flexGrow: 1 }}
          imageOverlay={
            item.accepted != null
              ? (
              <View
                style={{
                  backgroundColor: item.accepted ? "#00ff0080" : "#ff000080",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "100%"
                }}
              >
                <MaterialIcons
                  name={item.accepted ? "check" : "clear"}
                  size={40}
                  color="white"
                  style={{
                    position: "absolute",
                    top: 5,
                    left: 5,
                    alignItems: "center"
                  }}
                />
              </View>
                )
              : null
          }
          subtitleComponent={
            item.accepted != null ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start"
                  // flexShrink: 1
                }}
              >
                <IconButton
                  style={{ marginLeft: 15 }}
                  iconName={"undo"}
                  size={20}
                  color={"black"}
                  onPress={() => replaceItem({ accepted: null })}
                  label={"Undo"}
                />
                <IconButton
                  iconName={"check"}
                  size={20}
                  color={"blue"}
                  onPress={() => {
                    removeItem()
                    confirmResponseHandler(item, isNew)
                    playSound("complete")
                  }}
                  label={"Done"}
                />
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start"
                  // flexShrink: 1
                }}
              >
                <IconButton
                  style={{ marginLeft: 15 }}
                  iconName={"clear"}
                  size={20}
                  color={"red"}
                  onPress={() => {
                    replaceItem({ accepted: false })
                    playSound("confirm-down")
                  }}
                  label={"Reject"}
                />
                <IconButton
                  iconName={"check"}
                  size={20}
                  color={"green"}
                  onPress={() => {
                    replaceItem({ accepted: true })
                    playSound("confirm-up")
                  }}
                  label={"Accept"}
                />
              </View>
            )
          }
        />
      </View>
      <View
        style={{ height: 1, backgroundColor: "#efefef", marginHorizontal: 12 }}
      ></View>
    </View>
  )
}
