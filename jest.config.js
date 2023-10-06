module.exports = {
  verbose: true,
  preset: "jest-expo",
  setupFilesAfterEnv: [
    "<rootDir>/jest/setupNav.js",
    "<rootDir>/jest/setupBottomSheetMock.jsx",
    "<rootDir>/jest/setupMapMock.jsx",
    "<rootDir>/jest/setupKeyboardAwareMock.jsx",
    "<rootDir>/jest/setupAssetMocks.js",
    "<rootDir>/jest/setupFetch.js"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@alessiocancian/react-native-actionsheet|@sentry/.*|sentry-expo|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)"
  ],
  transform: {
    "^.+\\.jsx$": "babel-jest"
  },
  moduleNameMapper: {
    "^uuid$": require.resolve("uuid"),
    "^sentry-expo$": require.resolve("sentry-expo")
  }
}
