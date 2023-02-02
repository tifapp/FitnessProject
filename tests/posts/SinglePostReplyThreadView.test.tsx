import SinglePostReplyThreadView from "@components/postComponents/SinglePostReplyThreadView";
import { screen, fireEvent, render } from "@testing-library/react-native";
import { UserPost, TestUserPosts } from "../../lib/posts/UserPost";
import { View } from "react-native";

describe("Single Reply Thread tests", () => {
  it("should not have the full replies thread open by default", () => {
    renderSingleReplyThread(TestUserPosts.writtenByYou, TestUserPosts.blob);
    expectFullRepliesThreadToNotBeLoaded();
  });

  it("can open the full replies thread for a post", async () => {
    renderSingleReplyThread(TestUserPosts.writtenByYou, TestUserPosts.blob);
    openFullRepliesThread();
    await expectFullRepliesThreadToBeLoaded();
  });
});

const renderSingleReplyThread = (post: UserPost, reply: UserPost) => {
  render(
    <SinglePostReplyThreadView
      post={post}
      reply={reply}
      renderItem={() => <View />}
      renderFullRepliesView={() => <View testID="fullReplies" />}
    />
  );
};

const openFullRepliesThread = () => {
  fireEvent.press(screen.getByText("View All"));
};

const expectFullRepliesThreadToNotBeLoaded = () => {
  expect(screen.queryByTestId("fullReplies")).toBeNull();
};

const expectFullRepliesThreadToBeLoaded = async () => {
  expect(await screen.findByTestId("fullReplies")).toBeDefined();
};
