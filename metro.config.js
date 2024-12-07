// @ts-nocheck
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")
// https://docs.expo.dev/guides/using-sentry/#update-metro-configuration
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

const defaultConfig = getDefaultConfig(__dirname)

defaultConfig.transformer.babelTransformerPath = require.resolve("./build-config/babel.config.js")

module.exports = { ...defaultConfig, ...getSentryExpoConfig(__dirname) }
