import { UserID } from "../../lib/users/types";
import { UserPostID } from "../../lib/posts/UserPost";

describe("UserPostID tests", () => {
  it("should compose the id from a user id and post creation date", () => {
    const id = new UserPostID({
      creationDate: new Date("2023-01-31T00:00:00+0000"),
      userId: new UserID("test"),
    });
    expect(id.rawValue).toEqual("2023-01-31T00:00:00.000Z#test");
  });
});
