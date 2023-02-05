import { TestUserPosts } from "../lib/posts";
import HomeScreen, { HomeScreenViewReply } from "@screens/HomeScreen";
import { fireEvent, render, screen } from "@testing-library/react-native";
import "./helpers/Matchers";
import { Button, View } from "react-native";
import { EmptyView } from "@components/common/EmptyView";

describe("HomeScreen tests", () => {
  it("should not display the reply screen if no post and reply id are specified", () => {
    renderHomeScreen();
    expect(replyScreen()).not.toBeDisplayed();
  });

  it("should display a reply screen if given a post id and reply id", () => {
    renderHomeScreen({
      postId: TestUserPosts.writtenByYou.id,
      replyId: TestUserPosts.blob.id,
    });
    expect(replyScreen()).toBeDisplayed();
  });

  it("should no longer display the reply screen when dismissed", () => {
    renderHomeScreen({
      postId: TestUserPosts.writtenByYou.id,
      replyId: TestUserPosts.blob.id,
    });
    dismissReplyScreen();
    expect(replyScreen()).not.toBeDisplayed();
  });
});

const renderHomeScreen = (viewedReply?: HomeScreenViewReply) => {
  render(
    <HomeScreen
      feedView={<EmptyView />}
      replyView={(_, onDismissed: () => void) => (
        <View testID="viewed-reply">
          <Button title="dismiss" onPress={onDismissed} />
        </View>
      )}
      viewedReply={viewedReply}
    />
  );
};

const dismissReplyScreen = () => fireEvent.press(screen.getByText("dismiss"));

const replyScreen = () => screen.queryByTestId("viewed-reply");
