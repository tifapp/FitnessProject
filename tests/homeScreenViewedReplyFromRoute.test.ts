import { homeScreenViewedReplyFromRouteParams } from "@screens/HomeScreen";

const testPostId = "post";
const testReplyId = "reply";

describe("homeScreenViewedReplyFromRoute tests", () => {
  it("should return a HomeViewedReply when both a post and reply id are set", () => {
    const viewedReply = homeScreenViewedReplyFromRouteParams({
      postId: testPostId,
      replyId: testReplyId,
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
      postId: testPostId,
    });
    expect(viewedReply).toBeUndefined();
  });

  it("should return undefined when only reply id", () => {
    const viewedReply = homeScreenViewedReplyFromRouteParams({
      replyId: testReplyId,
    });
    expect(viewedReply).toBeUndefined();
  });
});
