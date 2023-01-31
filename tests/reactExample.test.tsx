import { Text, View, Button } from "react-native";
import { useState, useEffect } from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

interface TestProps {
  fetchNumber: () => Promise<number>;
}

const neverEndingNumberFetch = async () => await new Promise<number>(() => {});

const TestComponent = ({ fetchNumber }: TestProps) => {
  const [isShowingText, setIsShowingText] = useState(false);
  const [number, setNumber] = useState<number | undefined>();

  useEffect(() => {
    const fetch = async () => {
      setNumber(await fetchNumber());
    };
    fetch();
  }, []);

  return (
    <View>
      <Text>Hello World!</Text>
      <Button title="Tap Me!" onPress={() => setIsShowingText(true)} />
      {isShowingText && <Text>Button Test</Text>}
      {number!! ? (
        <Text>The number is {number}!</Text>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

describe("TestComponent tests", () => {
  it("should display hello world", () => {
    render(<TestComponent fetchNumber={neverEndingNumberFetch} />);
    expect(screen.getByText("Hello World!")).toBeDefined();
  });

  it("should display some text after clicking a button", () => {
    render(<TestComponent fetchNumber={neverEndingNumberFetch} />);
    fireEvent.press(screen.getByText("Tap Me!"));
    expect(screen.getByText("Button Test")).toBeDefined();
  });

  it("should be loading before fetching number", () => {
    render(<TestComponent fetchNumber={neverEndingNumberFetch} />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("should display the number 2 after fetching it", async () => {
    render(<TestComponent fetchNumber={async () => 2} />);
    expect(await screen.findByText("The number is 2!")).toBeDefined();
  });
});
