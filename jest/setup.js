const { addLogHandler, consoleLogHandler } = require("TiFShared/logging")
const { Switch } = require("react-native")
// https://github.com/facebook/react-native/issues/42904

addLogHandler(consoleLogHandler())
