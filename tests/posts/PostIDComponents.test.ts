import {
  componentsFromPostId,
  postIdFromComponents
} from "@lib/posts/PostIDComponents"

const testComponents = {
  creationDate: new Date("2023-01-31T00:00:00+0000"),
  userId: "test"
}
const testPostId = "2023-01-31T00:00:00.000Z#test"

describe("PostIDComponents tests", () => {
  it("should compose a post id from a user id and post creation date", () => {
    expect(postIdFromComponents(testComponents)).toEqual(testPostId)
  })

  it("should be able to decompose its components when it is composed of valid components", () => {
    expect(componentsFromPostId(testPostId)).toMatchObject(testComponents)
  })

  it("should have undefined components when incorrectly formatted raw string", () => {
    expect(componentsFromPostId("djbfcbuhd")).toBeUndefined()
  })

  it("should have undefined components when poorly formatted date", () => {
    expect(componentsFromPostId("totallyADate#test")).toBeUndefined()
  })

  test("creating from a string with more than 2 # symbols returns undefined", () => {
    expect(componentsFromPostId(testPostId + "#lmao")).toBeUndefined()
  })
})
