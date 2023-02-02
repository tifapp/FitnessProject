import SinglePostReplyThreadView from "@components/postComponents/SinglePostReplyThreadView";
import { screen, fireEvent, render } from "@testing-library/react-native";
import { UserPost, TestUserPosts, UserPostID } from "../../lib/posts/UserPost";
import { View } from "react-native";

describe("Single Reply Thread tests", () => {
  it("should not have the full replies thread for the parent post open by default", () => {
    givenSingleReplyThread(TestUserPosts.writtenByYou, TestUserPosts.blob);
    expectFullRepliesThreadToNotBeOpen(TestUserPosts.writtenByYou.id);
  });

  it("can open the full replies thread for the parent post", async () => {
    givenSingleReplyThread(TestUserPosts.writtenByYou, TestUserPosts.blob);
    openFullRepliesThread();
    await expectFullRepliesThreadToBeOpen(TestUserPosts.writtenByYou.id);
  });
});

const givenSingleReplyThread = (post: UserPost, reply: UserPost) => {
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

const expectFullRepliesThreadToNotBeOpen = (parentPostId: UserPostID) => {
  expect(screen.queryByTestId(parentPostId.rawValue)).toBeNull();
};

const expectFullRepliesThreadToBeOpen = async (parentPostId: UserPostID) => {
  expect(await screen.findByTestId(parentPostId.rawValue)).toBeDefined();
};
