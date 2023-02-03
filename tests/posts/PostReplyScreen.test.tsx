import { render, screen, waitFor } from "@testing-library/react-native";
import PostReplyScreen from "@screens/PostReplyScreen";
import { unimplementedPosts } from "./helpers";
import {
  Posts,
  groupUserPosts,
  UserPostID,
  TestUserPosts,
  PostsProvider,
} from "../../lib/posts";

let posts: Posts;

describe("Post Reply Screen tests", () => {
  beforeEach(() => (posts = unimplementedPosts));

  it("should indicate a loading status when the reply and parent post aren't loaded", () => {
    posts.postsWithIds = async () => await new Promise(jest.fn());
    makePostWithReply({
      postId: TestUserPosts.writtenByYou.id,
      replyId: TestUserPosts.blob.id,
    });
    expectLoadingIndication();
  });

  it("should not indicate a loading state when a reply and parent post are loaded", async () => {
    posts.postsWithIds = async () => {
      return groupUserPosts([TestUserPosts.writtenByYou, TestUserPosts.blob]);
    };
    makePostWithReply({
      postId: TestUserPosts.writtenByYou.id,
      replyId: TestUserPosts.blob.id,
    });
    await expectNoLoadingIndication();
  });
});

const makePostWithReply = (args: {
  postId: UserPostID;
  replyId: UserPostID;
}) => {
  render(
    <PostsProvider posts={posts}>
      <PostReplyScreen {...args} />
    </PostsProvider>
  );
};

const expectNoLoadingIndication = async () => {
  await waitFor(() => expect(screen.queryByLabelText("Loading...")).toBeNull());
};

const expectLoadingIndication = () => {
  expect(screen.getByLabelText("Loading...")).toBeDefined();
};
