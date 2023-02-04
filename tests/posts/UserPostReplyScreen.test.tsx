import UserPostReplyScreen from "@screens/UserPostReplyScreen";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { View } from "react-native";
import { neverPromise } from "../helpers/Promise";
import {
  groupUserPosts,
  TestUserPosts,
  UserPost,
  UserPostID,
  UserPosts,
  UserPostsProvider,
} from "../../lib/posts";
import "../helpers/Matchers";
import { unimplementedUserPosts } from "./helpers";

let userPosts: UserPosts;

const wasDismissed = jest.fn();

const testPost = TestUserPosts.writtenByYou;
const testReply = TestUserPosts.blob;

describe("UserPostReplyScreen tests", () => {
  beforeEach(() => (userPosts = unimplementedUserPosts));

  it("should indicate a loading state when post and reply aren't loaded", () => {
    userPosts.postsWithIds = () => neverPromise();
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    expect(loadingIndicator()).toBeDisplayed();
  });

  it("should display the post and reply when they are loaded", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost, testReply]);
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() => {
      expect(displayedPostWithId(testPost.id)).toBeDisplayed();
      expect(displayedPostWithId(testReply.id)).toBeDisplayed();
    });
  });

  it("should display the post when loaded and when it's reply is not found", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost]);
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() =>
      expect(displayedPostWithId(testPost.id)).toBeDisplayed()
    );
  });

  it("should indicate that the reply is not found when the post loads without it", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost]);
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() => expect(replyNotFoundIndicator()).toBeDisplayed());
  });

  it("should only display a post not found indicator when the post doesn't exist", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testReply]);
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() => {
      expect(postNotFoundIndicator()).toBeDisplayed();
      expect(displayedPostWithId(testReply.id)).not.toBeDisplayed();
    });
  });

  it("should allow the screen to be dismissed when the post is not found", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([]);
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() => {
      dismissScreen();
      expect(wasDismissed).toHaveBeenCalled();
    });
  });

  it("should display an error message when loading post and reply fails", async () => {
    userPosts.postsWithIds = async () => {
      throw new Error();
    };
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() => expect(errorMessage()).toBeDisplayed());
  });

  it("should allow a retry when an error occurs", async () => {
    let didRetry = false;
    let didFetch = false;
    userPosts.postsWithIds = async () => {
      if (didFetch) didRetry = true;
      didFetch = true;
      throw new Error();
    };

    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() => {
      retry();
      expect(didRetry).toBeTruthy();
    });
  });

  it("should have the error dismissed while retrying", async () => {
    let didFetch = false;
    userPosts.postsWithIds = async () => {
      if (didFetch) return await neverPromise();
      didFetch = true;
      throw new Error();
    };

    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() => {
      retry();
      expect(errorMessage()).not.toBeDisplayed();
    });
  });

  it("should be able to navigate to the full replies view when only the post is loaded", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost]);
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() => openExpectFullRepliesForPost(testPost.id));
  });

  it("should be able to navigate to the full replies view when both the post and reply are loaded", async () => {
    userPosts.postsWithIds = async () => groupUserPosts([testPost, testReply]);
    renderUserPostReplyScreen({ postId: testPost.id, replyId: testReply.id });
    await waitFor(() => openExpectFullRepliesForPost(testPost.id));
  });
});

const renderUserPostReplyScreen = ({
  postId,
  replyId,
}: {
  postId: UserPostID;
  replyId: UserPostID;
}) => {
  render(
    <UserPostsProvider posts={userPosts}>
      <UserPostReplyScreen
        userPostView={(post: UserPost) => <View testID={post.id.rawValue} />}
        fullRepliesView={(post: UserPost) => (
          <View testID={fullRepliesId(post.id)} />
        )}
        onDismiss={wasDismissed}
        postId={postId}
        replyId={replyId}
      />
    </UserPostsProvider>
  );
};

const fullRepliesId = (postId: UserPostID) => postId.rawValue + "-modal";

const loadingIndicator = () => screen.queryByLabelText("Loading...");

const displayedPostWithId = (id: UserPostID) => {
  return screen.queryByTestId(id.rawValue);
};

const postNotFoundIndicator = () => screen.queryByText("Post not found.");

const replyNotFoundIndicator = () => screen.queryByText("Reply not found.");

const dismissScreen = () => fireEvent.press(screen.getByText("Close"));

const errorMessage = () => screen.queryByText("Something went wrong...");

const retry = () => fireEvent.press(screen.getByText("Retry"));

const openFullReplies = () => fireEvent.press(screen.getByText("View All"));

const openExpectFullRepliesForPost = (postId: UserPostID) => {
  openFullReplies();
  expect(fullRepliesForPost(postId)).not.toBeNull();
};

const fullRepliesForPost = (postId: UserPostID) => {
  return screen.queryByTestId(fullRepliesId(postId));
};
