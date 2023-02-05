import { UserID } from "../../lib/users/types";
import { UserPostID } from "../../lib/posts/UserPost";

const testComponents = {
  creationDate: new Date("2023-01-31T00:00:00+0000"),
  userId: new UserID("test"),
};
const testRawIdValue = "2023-01-31T00:00:00.000Z#test";

describe("UserPostID tests", () => {
  it("should compose the id from a user id and post creation date", () => {
    const id = UserPostID.fromLegacyComponents(testComponents);
    expect(id.rawValue).toEqual(testRawIdValue);
  });

  it("should be able to decompose its components when it is composed of valid components", () => {
    const id = UserPostID.fromLegacyComponents(testComponents);
    expect(id.legacyComponents()).toMatchObject(testComponents);
  });

  it("should have undefined components when incorrectly formatted raw string", () => {
    const id = new UserPostID("sdkjhfsuidgf");
    expect(id.legacyComponents()).toBeUndefined();
  });

  it("should have undefined components when poorly formatted date", () => {
    const id = new UserPostID("totallyADate#test");
    expect(id.legacyComponents()).toBeUndefined();
  });

  test("creating from a string with more than 2 # symbols returns undefined", () => {
    const id = new UserPostID(testRawIdValue + "#lmao");
    expect(id.legacyComponents()).toBeUndefined();
  });
});
