module.exports = {
  verbose: true,
  preset: "jest-expo",
  setupFiles: [
    "<rootDir>/jest/setupNav.js",
    "<rootDir>/jest/setupBottomSheetMock.jsx",
    "<rootDir>/jest/setupMapMock.jsx",
    "<rootDir>/jest/setupKeyboardAwareMock.jsx"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],
  transform: {
    "^.+\\.jsx$": "babel-jest"
  }
}
