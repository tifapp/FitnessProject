/* eslint-disable @typescript-eslint/naming-convention */
// @ts-nocheck
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
jest.mock("react-native-maps", () => {
  const { View } = require("react-native")
  const MockMapView = (props) => {
    return <View>{props.children}</View>
  }
  const MockMarker = (props) => {
    return <View>{props.children}</View>
  }
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker
  }
})
