// @ts-nocheck
jest.mock("react-native-keyboard-aware-scroll-view", () => {
  const { FlatList, ScrollView } = require("react-native")
  const KeyboardAwareScrollView = ScrollView
  const KeyboardAwareFlatList = FlatList
  return { KeyboardAwareScrollView, KeyboardAwareFlatList }
})
