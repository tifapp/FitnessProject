import { TestUserPosts, UserPostID } from "../../lib/posts/UserPost";
import { render, screen } from "@testing-library/react-native";
import PostReplyScreen from "@screens/PostReplyScreen";

describe("Post Reply Screen tests", () => {
  it("should indicate a loading status when the reply and parent post aren't loaded", () => {
    givenPostWithReply({
      postId: TestUserPosts.writtenByYou.id,
      replyId: TestUserPosts.blob.id,
    });
    expectLoadingIndication();
  });
});

const givenPostWithReply = (args: {
  postId: UserPostID;
  replyId: UserPostID;
}) => {
  render(<PostReplyScreen {...args} />);
};

const expectLoadingIndication = () => {
  expect(screen.getByLabelText("Loading...")).toBeDefined();
};
