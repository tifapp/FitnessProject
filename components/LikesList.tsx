// Get the aws resources configuration parameters
import API, { graphqlOperation, GraphQLSubscription } from "@aws-amplify/api"
import APIList, { APIListRefType } from "@components/APIList"
import { ProfileImageAndName } from "@components/ProfileImageAndName"
import { likesByPost } from "@graphql/queries"
import {
  onCreateLikeForPost,
  onDeleteLikeForPost
} from "@graphql/subscriptions"
import printTime from "@hooks/printTime"
import React, { useEffect, useRef } from "react"
import { SafeAreaView, Text } from "react-native"
import { Like } from "src/models"

require("root/androidtimerfix")

interface Props {
  postId: string,
}

export default function LikesList ({ postId }: Props) {
  const listRef = useRef<APIListRefType<Like>>(null)

  useEffect(() => {
    const createLikeSubscription = API.graphql<GraphQLSubscription<{onCreateLikeForPost: Like}>>(
      graphqlOperation(onCreateLikeForPost, { postId })
    ).subscribe({
      next: (event) => {
        const newLike = event.value.data?.onCreateLikeForPost
        if (!newLike) return
        listRef.current?.addItem(newLike)
      }
    })
    const deleteLikeSubscription = API.graphql<GraphQLSubscription<{onDeleteLikeForPost: Like}>>(
      graphqlOperation(onDeleteLikeForPost, { postId })
    ).subscribe({
      next: (event) => {
        const deletedLike = event.value.data?.onDeleteLikeForPost
        if (!deletedLike) return
        listRef.current?.removeItem((like) => like.userId === deletedLike.userId)
      }
    })
    return () => {
      createLikeSubscription.unsubscribe()
      deleteLikeSubscription.unsubscribe()
    }
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APIList
        ref={listRef}
        initialAmount={10}
        additionalAmount={20}
        queryOperation={likesByPost}
        queryOperationName={"likesByPost"}
        filter={{ postId, sortDirection: "DESC" }}
        renderItem={({ item }: { item: Like }) => (
          <ProfileImageAndName
            style={{ margin: 15 }}
            userId={item.userId}
            subtitleComponent={
              <Text style={{ color: "gray" }}>{printTime(item.createdAt)}</Text>
            }
          />
        )}
        keyExtractor={(item: Like) => item.userId}
      />
    </SafeAreaView>
  )
}
