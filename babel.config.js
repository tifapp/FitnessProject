/* eslint-disable @typescript-eslint/naming-convention */
// @ts-nocheck
/* eslint-disable comma-dangle */
/* eslint-disable semi */
const path = require("path")

const modulePath = (dir) => {
  return path.join(__dirname, dir)
}

module.exports = function (api) {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module:react-native-dotenv", { moduleName: "env", path: ".env" }],
      ["@babel/plugin-transform-flow-strip-types"],
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      [
        "module-resolver",
        {
          alias: {
            "@screens": modulePath("screens"),
            "@api-client": modulePath("api-client"),
            "@components": modulePath("components"),
            "@stacks": modulePath("stacks"),
            "@hooks": modulePath("hooks"),
            "@assets": modulePath("assets"),
            "@graphql": modulePath("src/graphql"),
            "@lib": modulePath("lib"),
            "@auth": modulePath("auth"),
            "@event-details": modulePath("event-details"),
            "@location": modulePath("location"),
            "@modules": modulePath("modules"),
            "@content-parsing": modulePath("content-parsing"),
            "@date-time": modulePath("date-time"),
            "@test-helpers": modulePath("test-helpers")
          },
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
      ],
      "react-native-reanimated/plugin"
    ]
  }
}
