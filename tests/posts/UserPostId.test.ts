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
    expect(UserPostID.fromRawValue("hello world")).not.toBeDefined();
  });

  test("creating from a string with an invalid date returns undefined", () => {
    expect(UserPostID.fromRawValue("totallyADate#test")).not.toBeDefined();
  });

  test("creating from a string with more than 2 # symbols returns undefined", () => {
    expect(UserPostID.fromRawValue(testRawIdValue + "#lmao"));
  });
});
