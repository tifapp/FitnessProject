import PostWithSingleReplyView from "@components/postComponents/PostWithSingleReplyView";
import { screen, fireEvent, render } from "@testing-library/react-native";
import { UserPost, TestUserPosts } from "../../lib/posts/UserPost";
import { Text } from "react-native";

describe("Post With Single Reply tests", () => {
  it("can navigate to the full replies thread for a post", async () => {
    renderPostWithReply(TestUserPosts.writtenByYou, TestUserPosts.blob);
    expectFullRepliesThreadToNotBeLoaded();
    navigateToFullReplies();
    await expectFullRepliesThreadDidLoad();
  });
});

const renderPostWithReply = (post: UserPost, reply: UserPost) => {
  render(
    <PostWithSingleReplyView
      post={post}
      reply={reply}
      fullRepliesView={(post: UserPost) => (
        <Text testID="fullReplies">{post.description}</Text>
      )}
    />
  );
};

const navigateToFullReplies = () => {
  fireEvent.press(screen.getByText("View All"));
};

const expectFullRepliesThreadToNotBeLoaded = () => {
  expect(screen.queryByTestId("fullReplies")).toBeNull();
};

const expectFullRepliesThreadDidLoad = async () => {
  expect(await screen.findByTestId("fullReplies")).toBeDefined();
};
