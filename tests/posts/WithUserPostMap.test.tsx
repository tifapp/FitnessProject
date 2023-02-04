import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react-native";
import WithUserPostMap from "@components/postComponents/WithUserPostMap";
import { unimplementedUserPosts } from "./helpers";
import {
  UserPosts,
  groupUserPosts,
  UserPostID,
  TestUserPosts,
  UserPostsProvider,
  UserPostMap,
} from "../../lib/posts";
import { Button, Text, View } from "react-native";
import { neverPromise } from "../helpers/Promise";

let userPosts: UserPosts;

const userPostsModels = [TestUserPosts.blob];
const userPostsIds = [TestUserPosts.blob.id];

describe("WithUserPostMap tests", () => {
  beforeEach(() => (userPosts = unimplementedUserPosts));

  it("should indicate a loading status when posts aren't loaded", () => {
    userPosts.postsWithIds = async () => await neverPromise();
    makeUserPostMap(userPostsIds);
    expectLoadingIndication();
  });

  it("should indicate an error when posts fail to load", async () => {
    const errorMessage = "Something went wrong...";
    userPosts.postsWithIds = async () => {
      throw new Error(errorMessage);
    };
    makeUserPostMap(userPostsIds);
    await expectErrorMessage(errorMessage);
  });

  it("should indicate that posts are available when loaded", async () => {
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
