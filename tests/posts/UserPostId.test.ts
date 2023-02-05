import { UserID } from "../../lib/users/types";
import { UserPostID } from "../../lib/posts/UserPost";

const testComponents = {
  creationDate: new Date("2023-01-31T00:00:00+0000"),
  userId: new UserID("test"),
};
const testRawIdValue = "2023-01-31T00:00:00.000Z#test";

describe("UserPostID tests", () => {
  it("should compose the id from a user id and post creation date", () => {
    const id = new UserPostID(testComponents);
    expect(id.rawValue).toEqual(testRawIdValue);
  });

  it("should be able to decompose its components", () => {
    const id = new UserPostID(testComponents);
    expect(id.components()).toMatchObject(testComponents);
  });

  test("creating from a correctly formatted raw string returns the proper id", () => {
    const id = UserPostID.fromRawValue(testRawIdValue);
    expect(id).toMatchObject(new UserPostID(testComponents));
  });

  test("creating from an incorrectly formatted raw string returns undefined", () => {
    const id = UserPostID.fromRawValue("hello world");
    expect(id).not.toBeDefined();
  });

  test("creating from a string with an ivalid date returns undefined", () => {
    const id = UserPostID.fromRawValue("totallyADate#test");
    expect(id).not.toBeDefined();
  });
});
