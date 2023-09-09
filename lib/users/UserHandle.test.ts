import { UserHandle } from "./UserHandle"

describe("UserHandle tests", () => {
  it("should not pass validation when longer than 15 characters", () => {
    expect(UserHandle.validate("abcdefghijklmnopqrstuvwxyz")).toBeUndefined()
  })

  it("should not pass validation when empty", () => {
    expect(UserHandle.validate("")).toBeUndefined()
  })

  it("should not pass validation when special characters included", () => {
    expect(UserHandle.validate("asdjkbnf&*(&*(")).toBeUndefined()
  })

  test("basic valid user handles", () => {
    expect(UserHandle.validate("abc123")?.toString()).toEqual("@abc123")
    expect(UserHandle.validate("elon_musk")?.toString()).toEqual("@elon_musk")
    expect(UserHandle.validate("im_15_character")?.toString()).toEqual(
      "@im_15_character"
    )
    expect(UserHandle.validate("1234567890")?.toString()).toEqual("@1234567890")
    expect(UserHandle.validate("ABCDEFG")?.toString()).toEqual("@ABCDEFG")
  })
})
