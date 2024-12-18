import "@test-helpers/Matchers"
import { render } from "@testing-library/react-native"
import { AvatarView } from "./Avatar"

describe("Avatar tests", () => {
  it.each([
    ["AP", "Artoria Pendragon"],
    ["SN", "Sean"],
    ["JM", "Joe K. Morlin"],
    ["?", ""],
    ["?", "        "],
    ["S", "s"],
    ["BB", "Blob"],
    ["BB", "Blob "],
    ["BB", "Blob   "]
  ])(
    "should display avatar initials as %s",
    (initials: string, name: string) => {
      const { queryByText } = render(<AvatarView name={name} />)
      expect(queryByText(initials)).toBeDisplayed()
    }
  )
})
