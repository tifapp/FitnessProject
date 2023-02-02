import SinglePostReplyThreadView from "@components/postComponents/SinglePostReplyThreadView";
import { screen, fireEvent, render } from "@testing-library/react-native";
import { UserPost, TestUserPosts, UserPostID } from "../../lib/posts/UserPost";
import { View } from "react-native";
import { UserID } from "../../lib/users/types";

describe("Single Reply Thread tests", () => {
  it("should not have the full replies thread for the parent post open by default", () => {
    renderSingleReplyThread(TestUserPosts.writtenByYou, TestUserPosts.blob);
    expectFullRepliesThreadToNotBeLoaded(TestUserPosts.writtenByYou.id);
  });

  it("can open the full replies thread for the parent post", async () => {
    renderSingleReplyThread(TestUserPosts.writtenByYou, TestUserPosts.blob);
    openFullRepliesThread();
    await expectFullRepliesThreadToBeLoaded(TestUserPosts.writtenByYou.id);
  });
});

const renderSingleReplyThread = (post: UserPost, reply: UserPost) => {
  render(
    <SinglePostReplyThreadView
      post={post}
      reply={reply}
      renderItem={() => <View />}
      renderFullRepliesView={(post: UserPost) => (
        <View testID={post.id.rawValue} />
      )}
    />
  );
};

const openFullRepliesThread = () => {
  fireEvent.press(screen.getByText("View All"));
};

const expectFullRepliesThreadToNotBeLoaded = (parentPostId: UserPostID) => {
  expect(screen.queryByTestId(parentPostId.rawValue)).toBeNull();
};

const expectFullRepliesThreadToBeLoaded = async (parentPostId: UserPostID) => {
  expect(await screen.findByTestId(parentPostId.rawValue)).toBeDefined();
};
