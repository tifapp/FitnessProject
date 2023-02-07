import { MaterialIcons } from "@expo/vector-icons";
import { render } from "@testing-library/react-native";

describe("Make sure importing expo doesn't cause the universe to explode", () => {
  it("should be like a normal unit test suite and not explode", () => {
    render(<MaterialIcons name="10k" />);
    expect(1).toEqual(1);
  });
});
