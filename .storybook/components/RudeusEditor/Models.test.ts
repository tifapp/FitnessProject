import { uuidString } from "TiFShared/lib/UUID"
import { EMPTY_PATTERN_EDITOR_PATTERN, editorPattern } from "./Models"

describe("Models tests", () => {
  describe("EditorPattern tests", () => {
    const TEST_PATTERN = {
      id: uuidString(),
      name: "Blob",
      description: "This is a cool pattern",
      user: {
        id: uuidString(),
        name: "Blob"
      },
      ahapPattern: EMPTY_PATTERN_EDITOR_PATTERN.ahapPattern,
      platform: "android" as const
    }

    it("should remove the id when the user id does not match", () => {
      expect(editorPattern(TEST_PATTERN, uuidString())).toEqual({
        id: null,
        name: "Blob",
        description: "This is a cool pattern",
        ahapPattern: EMPTY_PATTERN_EDITOR_PATTERN.ahapPattern
      })
    })

    it("should keep the id when the user id matches", () => {
      expect(editorPattern(TEST_PATTERN, TEST_PATTERN.user.id)).toEqual({
        id: TEST_PATTERN.id,
        name: "Blob",
        description: "This is a cool pattern",
        ahapPattern: EMPTY_PATTERN_EDITOR_PATTERN.ahapPattern
      })
    })
  })
})
