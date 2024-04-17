jest.mock("react-native-launch-arguments", () => {
  return {
    LaunchArguments: {
      value: jest.fn().mockReturnValue({})
    }
  }
})
