import PostWithReplyDetailScreen from "@screens/PostWithReplyDetailScreen";
import { screen, fireEvent, render } from "@testing-library/react-native";
import { UserPost, TestUserPosts } from "../../lib/posts/UserPost";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

describe("PostWithReplyDetailScreen tests", () => {
  it("can navigate to the full comments thread for a post", async () => {
    renderPostWithReply(TestUserPosts.writtenByYou, TestUserPosts.blob);
    expectCommentsThreadToNotBeLoaded();
    navigateToCommentsThread();
    await expectCommentsThreadDidLoad();
  });
});

const Drawer = createDrawerNavigator();

const renderPostWithReply = (post: UserPost, reply: UserPost) => {
  render(
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="test">
          {() => <PostWithReplyDetailScreen post={post} reply={reply} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const navigateToCommentsThread = () => {
  fireEvent.press(screen.getByText("View All"));
};

const expectCommentsThreadToNotBeLoaded = () => {
  expect(screen.queryByText("Replying to")).toBeNull();
};

const expectCommentsThreadDidLoad = async () => {
  expect(await screen.findByText("Replying to")).toBeDefined();
};
