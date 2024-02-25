/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  verbose: true,
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest/setup.js"],
  setupFilesAfterEnv: [
    "<rootDir>/jest/setupAnimations.js",
    "<rootDir>/jest/setupNav.js",
    "<rootDir>/jest/setupBottomSheetMock.jsx",
    "<rootDir>/jest/setupMapMock.jsx",
    "<rootDir>/jest/setupKeyboardAwareMock.jsx",
    "<rootDir>/jest/setupAssetMocks.js",
    "<rootDir>/jest/setupFetch.js",
    "<rootDir>/jest/setupInfraEnv.js",
    "<rootDir>/jest/setupSQLite.js"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|native-base|react-native-svg|@alessiocancian/react-native-actionsheet|@sentry/.*|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)"
  ],
  transform: {
    "^.+\\.jsx$": "babel-jest"
  },
  moduleNameMapper: {
    "^uuid$": require.resolve("uuid"),
    "^@sentry/react-native$": require.resolve("@sentry/react-native")
  }
}
