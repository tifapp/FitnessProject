import UserPostReplyScreen from "@screens/UserPostReplyScreen"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { Button, View } from "react-native"
import { neverPromise } from "../helpers/Promise"
import { groupUserPosts, TestUserPosts, UserPost, UserPosts } from "@lib/posts"
import "../helpers/Matchers"
import { unimplementedUserPosts } from "./helpers"
import React from "react"
import { SetDependencyValue } from "../../lib/dependencies"
import { userPostsDependencyKey } from "../../lib/posts/UserPosts"

let userPosts: UserPosts

const wasDismissed = jest.fn()

const testPost = TestUserPosts.writtenByYou
const testReply = TestUserPosts.blob

describe("UserPostReplyScreen tests", () => {
  beforeEach(() => (userPosts = unimplementedUserPosts))

  it("should indicate a loading state when post and reply aren't loaded", () => {
    userPosts.postsWithIds = () => neverPromise()
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    expect(loadingIndicator()).toBeDisplayed()
  })

  it("should display the post and reply when they are loaded", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost, testReply])
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => {
      expect(displayedPostWithId(testPost.id)).toBeDisplayed()
      expect(displayedPostWithId(testReply.id)).toBeDisplayed()
    })
  })

  it("should display the post when loaded and when it's reply is not found", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost])
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() =>
      expect(displayedPostWithId(testPost.id)).toBeDisplayed()
    )
  })

  it("should indicate that the reply is not found when the post loads without it", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost])
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => expect(replyNotFoundIndicator()).toBeDisplayed())
  })

  it("should only display a post not found indicator when the post doesn't exist", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testReply])
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => {
      expect(postNotFoundIndicator()).toBeDisplayed()
      expect(displayedPostWithId(testReply.id)).not.toBeDisplayed()
    })
  })

  it("should allow the screen to be dismissed when the post is not found", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([])
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => {
      dismiss()
      expect(wasDismissed).toHaveBeenCalled()
    })
  })

  it("should display an error message when loading post and reply fails", async () => {
    userPosts.postsWithIds = async () => {
      throw new Error()
    }
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => expect(errorMessage()).toBeDisplayed())
  })

  it("should allow a retry when an error occurs", async () => {
    let didRetry = false
    let didFetch = false
    userPosts.postsWithIds = async () => {
      if (didFetch) didRetry = true
      didFetch = true
      throw new Error()
    }

    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => {
      retry()
      expect(didRetry).toBeTruthy()
    })
  })

  it("should have the error dismissed while retrying", async () => {
    let didFetch = false
    userPosts.postsWithIds = async () => {
      if (didFetch) return await neverPromise()
      didFetch = true
      throw new Error()
    }

    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => {
      retry()
      expect(errorMessage()).not.toBeDisplayed()
    })
  })

  it("should be able to navigate to the full replies view when only the post is loaded", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost])
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => openExpectFullRepliesForPost(testPost.id))
  })

  it("should be able to navigate to the full replies view when both the post and reply are loaded", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost, testReply])
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => openExpectFullRepliesForPost(testPost.id))
  })

  it("should be dismissed when the loaded post is deleted", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost, testReply])
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id })
    await waitFor(() => {
      deletePostWithId(testPost.id)
      expect(wasDismissed).toHaveBeenCalled()
    })
  })
})

const renderUserPostReplyScreen = ({
  postId,
  replyId
}: {
  postId: string;
  replyId: string;
}) => {
  render(
    <SetDependencyValue forKey={userPostsDependencyKey} value={userPosts}>
      <UserPostReplyScreen
        userPostView={(post: UserPost, onDeleted?: () => void) => (
          <View testID={post.id}>
            <Button
              testID={deleteButtonId(post.id)}
              title="delete"
              onPress={() => onDeleted?.()}
            />
          </View>
        )}
        fullRepliesView={(post: UserPost) => (
          <View testID={fullRepliesId(post.id)} />
        )}
        onDismiss={wasDismissed}
        postId={postId}
        replyId={replyId}
      />
    </SetDependencyValue>
  )
}

const fullRepliesId = (postId: string) => postId + "-modal"

const loadingIndicator = () => screen.queryByLabelText("Loading...")

const displayedPostWithId = (id: string) => {
  return screen.queryByTestId(id)
}

const postNotFoundIndicator = () => screen.queryByText("Post not found.")

const replyNotFoundIndicator = () => screen.queryByText("Reply not found.")

const dismiss = () => fireEvent.press(screen.getByText("Close"))

const errorMessage = () => screen.queryByText("Something went wrong...")

const retry = () => fireEvent.press(screen.getByText("Retry"))

const openFullReplies = () => {
  fireEvent.press(screen.getByText("View All Replies"))
}

const deleteButtonId = (postId: string) => `delete-${postId}`

const deletePostWithId = (postId: string) => {
  fireEvent.press(screen.getByTestId(deleteButtonId(postId)))
}

const openExpectFullRepliesForPost = (postId: string) => {
  openFullReplies()
  expect(fullRepliesForPost(postId)).not.toBeNull()
}

const fullRepliesForPost = (postId: string) => {
  return screen.queryByTestId(fullRepliesId(postId))
}
