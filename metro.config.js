// @ts-nocheck
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")
// https://docs.expo.dev/guides/using-sentry/#update-metro-configuration
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

module.exports = { ...getDefaultConfig(__dirname), ...getSentryExpoConfig(__dirname) }
