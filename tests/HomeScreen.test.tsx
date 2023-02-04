import { TestUserPosts, UserPostChannel } from "../lib/posts";
import HomeScreen, { HomeScreenViewReply } from "@screens/HomeScreen";
import { render, screen } from "@testing-library/react-native";
import "./helpers/Matchers";
import { View } from "react-native";

const testChannel = new UserPostChannel("test");

describe("HomeScreen tests", () => {
  it("should display a reply screen if given a post id and reply id", () => {
    renderHomeScreen({
      postId: TestUserPosts.writtenByYou.id,
      replyId: TestUserPosts.blob.id,
    });
    expect(replyScreen()).toBeDisplayed();
  });

  it("should disply a feed for the test channel", () => {
    renderHomeScreen();
    expect(feed()).toBeDisplayed();
  });
});

const renderHomeScreen = (viewedReply?: HomeScreenViewReply) => {
  render(
    <HomeScreen
      feedView={(channel: UserPostChannel) => (
        <View testID={channel.rawValue} />
      )}
      replyView={() => <View testID="viewed-reply" />}
      channel={testChannel}
      viewedReply={viewedReply}
    />
  );
};

const feed = () => screen.queryByTestId(testChannel.rawValue);
const replyScreen = () => screen.queryByTestId("viewed-reply");
