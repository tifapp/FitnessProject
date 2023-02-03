import { render, screen, waitFor } from "@testing-library/react-native";
import WithPosts from "@components/postComponents/WithPosts";
import { unimplementedPosts } from "./helpers";
import {
  Posts,
  groupUserPosts,
  UserPostID,
  TestUserPosts,
  PostsProvider,
  UserPost,
  UserPostMap,
} from "../../lib/posts";
import { Text, View } from "react-native";

let posts: Posts;

const userPosts = [TestUserPosts.blob];
const postIds = [TestUserPosts.blob.id];

describe("With Posts tests", () => {
  beforeEach(() => (posts = unimplementedPosts));

  it("should indicate a loading status when posts aren't loaded", () => {
    posts.postsWithIds = async () => await new Promise(() => {});
    makePosts(postIds);
    expectLoadingIndication();
  });

  it("should indicate an error when posts fail to load", async () => {
    posts.postsWithIds = async () => {
      throw new Error("Lmao");
    };
    makePosts(postIds);
    await expectErrorMessage("Lmao");
  });

  it("should not indicate a loading state when posts are loaded", async () => {
    posts.postsWithIds = async () => groupUserPosts(userPosts);
    makePosts(postIds);
    await expectNoLoadingIndication();
  });

  it("should indicate posts when available", async () => {
    posts.postsWithIds = async () => groupUserPosts(userPosts);
    makePosts(postIds);
    await expectUserPostWithIdIsPresent(postIds[0]);
  });
});

const makePosts = (postIds: UserPostID[]) => {
  render(
    <PostsProvider posts={posts}>
      <WithPosts
        renderError={(error: Error) => <Text>{error.message}</Text>}
        renderLoading={() => <View testID="loading" />}
        postIds={postIds}
      >
        {(posts: UserPostMap) =>
          Array.from(posts).map(([id, _]) => (
            <View key={id.rawValue} testID={id.rawValue} />
          ))
        }
      </WithPosts>
    </PostsProvider>
  );
};

const expectErrorMessage = async (message: string) => {
  expect(await screen.findByText(message));
};

const expectNoLoadingIndication = async () => {
  await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
};

const expectLoadingIndication = () => {
  expect(screen.getByTestId("loading")).toBeDefined();
};

const expectUserPostWithIdIsPresent = async (id: UserPostID) => {
  await waitFor(() => expect(screen.getByTestId(id.rawValue)).toBeDefined());
};
