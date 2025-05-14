/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
// @ts-nocheck
jest.mock("@gorhom/bottom-sheet", () => {
  const reactNative = jest.requireActual("react-native")
  const { View } = reactNative
  const BottomSheet = jest.requireActual("@gorhom/bottom-sheet")
  return {
    __esModule: true,
    ...BottomSheet,
    BottomSheetView: View,
    BottomSheetModal: View,
    BottomSheetModalProvider: View,
    useBottomSheetModal: () => ({ dismissAll: () => {} })
  }
})
