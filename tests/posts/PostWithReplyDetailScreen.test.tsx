import PostWithReplyDetailScreen from "@screens/PostWithReplyDetailScreen";
import { screen, fireEvent, render } from "@testing-library/react-native";
import { UserPost } from "../../lib/posts/types";
import { UserID } from "../../lib/users/types";
import { NavigationContainer } from "@react-navigation/native";
import { mockModal } from "../helpers/ModalMock";
import { createDrawerNavigator } from "@react-navigation/drawer";

mockModal();
const Drawer = createDrawerNavigator();

const testPost: UserPost = {
  userId: new UserID("post"),
  likesCount: 0,
  repliesCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  description: "this is a post",
  channel: null,
  receiver: null,
  imageURL: null,
  likedByYou: false,
  writtenByYou: true,
};

const testReply: UserPost = {
  userId: new UserID("reply"),
  likesCount: 0,
  repliesCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  description: "this is a reply",
  channel: null,
  receiver: null,
  imageURL: null,
  likedByYou: false,
  writtenByYou: false,
};

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

const expectCommentsThreadDidLoad = async () => {
  expect(await screen.findByText("Replying to")).toBeDefined();
};

describe("PostWithReplyDetailScreen tests", () => {
  it("can navigate to the full comments thread for a post", async () => {
    renderPostWithReply(testPost, testReply);
    navigateToCommentsThread();
    await expectCommentsThreadDidLoad();
  });
});
