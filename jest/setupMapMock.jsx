/* eslint-disable @typescript-eslint/naming-convention */
// @ts-nocheck
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
jest.mock("react-native-maps", () => {
  const { View } = require("react-native")
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Circle: View
  }
})
