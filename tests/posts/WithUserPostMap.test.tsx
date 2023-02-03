import { render, screen, waitFor } from "@testing-library/react-native";
import WithUserPostMap from "@components/postComponents/WithUserPostMap";
import { unimplementedUserPosts } from "./helpers";
import {
  UserPosts,
  groupUserPosts,
  UserPostID,
  TestUserPosts,
  UserPostsProvider,
  UserPost,
  UserPostMap,
} from "../../lib/posts";
import { Text, View } from "react-native";

let userPosts: UserPosts;

const userPostsModels = [TestUserPosts.blob];
const userPostsIds = [TestUserPosts.blob.id];

describe("WithUserPostMap tests", () => {
  beforeEach(() => (userPosts = unimplementedUserPosts));

  it("should indicate a loading status when posts aren't loaded", () => {
    userPosts.postsWithIds = async () => await new Promise(() => {});
    makeUserPostMap(userPostsIds);
    expectLoadingIndication();
  });

  it("should indicate an error when posts fail to load", async () => {
    userPosts.postsWithIds = async () => {
      throw new Error("Lmao");
    };
    makeUserPostMap(userPostsIds);
    await expectErrorMessage("Lmao");
  });

  it("should indicate posts when available", async () => {
    userPosts.postsWithIds = async () => groupUserPosts(userPostsModels);
    makeUserPostMap(userPostsIds);
    await expectUserPostWithIdIsPresent(userPostsIds[0]);
  });
});

const makeUserPostMap = (postIds: UserPostID[]) => {
  render(
    <UserPostsProvider posts={userPosts}>
      <WithUserPostMap
        errorView={(error: Error) => <Text>{error.message}</Text>}
        loadingView={<View testID="loading" />}
        userPostIds={postIds}
      >
        {(posts: UserPostMap) =>
          Array.from(posts).map(([id, _]) => (
            <View key={id.rawValue} testID={id.rawValue} />
          ))
        }
      </WithUserPostMap>
    </UserPostsProvider>
  );
};

const expectErrorMessage = async (message: string) => {
  expect(await screen.findByText(message));
};

const expectLoadingIndication = () => {
  expect(screen.getByTestId("loading")).toBeDefined();
};

const expectUserPostWithIdIsPresent = async (id: UserPostID) => {
  await waitFor(() => expect(screen.getByTestId(id.rawValue)).toBeDefined());
};
