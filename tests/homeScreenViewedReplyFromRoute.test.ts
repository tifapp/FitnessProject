import { homeScreenViewedReplyFromRouteParams } from "@screens/HomeScreen";
import { UserPostID } from "@lib/posts";

const testPostId = new UserPostID("post");
const testReplyId = new UserPostID("reply");

describe("homeScreenViewedReplyFromRoute tests", () => {
  it("should return a HomeViewedReply when both a post and reply id are set", () => {
    const viewedReply = homeScreenViewedReplyFromRouteParams({
      postId: testPostId.rawValue,
      replyId: testReplyId.rawValue,
    });
    expect(viewedReply).toMatchObject({
      postId: testPostId,
      replyId: testReplyId,
    });
  });

  it("should return undefined when undefined params", () => {
    const viewedReply = homeScreenViewedReplyFromRouteParams(undefined);
    expect(viewedReply).toBeUndefined();
  });

  it("should return undefined when only post id", () => {
    const viewedReply = homeScreenViewedReplyFromRouteParams({
      postId: testPostId.rawValue,
    });
    expect(viewedReply).toBeUndefined();
  });

  it("should return undefined when only reply id", () => {
    const viewedReply = homeScreenViewedReplyFromRouteParams({
      replyId: testReplyId.rawValue,
    });
    expect(viewedReply).toBeUndefined();
  });
});
