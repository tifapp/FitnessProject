import { renderHook } from "@testing-library/react-native"
import { useSignUpChangeUserHandle } from "./ChangeUserHandle"

describe("SignUpChangeUserHandle tests", () => {
  describe("useSignUpChangeUserHandle", () => {
    it("should debounce when looking up a new user handle", async () => {
      const { result } = renderUseSignUpChangeUserHandle("elon_musk")
    })

    const renderUseSignUpChangeUserHandle = (initialHandle: string) => {
      return renderHook(() => useSignUpChangeUserHandle(initialHandle))
    }
  })
})
