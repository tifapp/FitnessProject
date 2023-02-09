import APIList, { APIListRefType } from "@components/APIList"
import { ProfileImageAndName } from "@components/ProfileImageAndName"
import { deleteBlock } from "@graphql/mutations"
import { blocksByDate } from "@graphql/queries"
import printTime from "@hooks/printTime"
import { useNavigation } from "@react-navigation/native"
import { API, graphqlOperation } from "aws-amplify"
import React, { useEffect, useRef, useState } from "react"
import {
  Alert, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { Block } from "src/models"

const BlockListScreen = () => {
  const navigation = useNavigation()
  const listRef = useRef<APIListRefType<Block> | null>(null)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  const alertOptions = {
    cancelable: true,
    onDismiss: () => setIsOptionsOpen(false)
  }

  const unblock = async (blockeeId: string) => {
    const title = "Are you sure you want to unblock this friend?"
    const options = [
      {
        text: "Yes",
        onPress: () => {
          console.log("about to delete this user: ", blockeeId)
          globalThis.localBlockList = listRef.current?.removeItem((item) => item.blockee === blockeeId) ?? []
          API.graphql(
            graphqlOperation(deleteBlock, {
              input: { userId: globalThis.myId, blockee: blockeeId }
            })
          )
        }
      },
      {
        text: "Cancel",
        type: "cancel",
        onPress: () => {
          setIsOptionsOpen(false)
        }
      }
    ]
    Alert.alert(title, "", options, alertOptions)
  }

  useEffect(() => {
    const onFocus = navigation.addListener("focus", () => {
      // console.log("got to settings", global.localBlockList);
      // we just want to save a copy of the data
      listRef.current?.replaceList([...global.localBlockList])
    })

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return onFocus
  }, [navigation])

  return (
    <APIList
      initialAmount={10}
      additionalAmount={20}
      queryOperation={blocksByDate}
      queryOperationName={"blocksByDate"}
      ref={listRef}
      renderItem={({ item }) => ( // needs API list template type
        <View
          style={{
            flexDirection: "row",
            alignSelf: "flex-start",
            alignItems: "center",
            marginVertical: 5,
            justifyContent: "space-evenly"
          }}
        >
          <ProfileImageAndName
            imageStyle={[styles.smallImageStyle, { marginHorizontal: 20 }]}
            userId={item.blockee}
            sibling={
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  flex: 1,
                  marginHorizontal: 30
                }}
              >
                <Text style={{ marginHorizontal: 16, color: "gray" }}>
                  {printTime(item.createdAt)}
                </Text>

                <TouchableOpacity onPress={() => unblock(item.blockee)}>
                  <Text>
                    unblock
                    {
                      // then ask to verify the unblocking, like with friend requests
                      // should disappear from the list when confirming, or just fade out? maybe jump to bottom with the option to reblock that person
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      )}
      notRefreshable={true}
      filter={{ userId: globalThis.myId }}
      contentContainerStyle={{
        flexGrow: 1,
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center"
      }}
      keyExtractor={(item: Block) => item.blockee} // needs template type. see how tesla does it
      ListEmptyMessage={"You haven't blocked anyone."}
    />
  )
}

export default BlockListScreen

const styles = StyleSheet.create({
  smallImageStyle: {
    resizeMode: "cover",
    height: 50,
    width: 50
  }
})
