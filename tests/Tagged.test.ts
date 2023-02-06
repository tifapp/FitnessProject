import { Tagged } from "@lib/Tagged";

type TestType = {};

describe("Tagged tests", () => {
  it("should be able map the raw value from a tagged instance to a new tagged instance of the same type", () => {
    const mapped = new Tagged<TestType, number>(1).map((rv) => rv + 1);
    expect(mapped).toMatchObject(new Tagged<TestType, number>(2));
  });

  it("should be able to map the raw value to a different raw value type on a new tagged instance", () => {
    const mapped = new Tagged<TestType, number>(2).map((rawValue) =>
      "a".repeat(rawValue)
    );
    expect(mapped).toMatchObject(new Tagged<TestType, string>("aa"));
  });
});
