/* eslint-disable @typescript-eslint/naming-convention */
// @ts-nocheck
/* eslint-disable comma-dangle */
/* eslint-disable semi */
const path = require("path")
const rootPath = __dirname

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
            "@screens": path.join(rootPath, "screens"),
            "@api-client": path.join(rootPath, "api-client"),
            "@components": path.join(rootPath, "components"),
            "@stacks": path.join(rootPath, "stacks"),
            "@hooks": path.join(rootPath, "hooks"),
            "@assets": path.join(rootPath, "assets"),
            "@graphql": path.join(rootPath, "src/graphql"),
            "@lib": path.join(rootPath, "lib"),
            "@auth": path.join(rootPath, "auth"),
            "@event-details": path.join(rootPath, "event-details"),
            "@location-search": path.join(rootPath, "location-search"),
            "@root-feature": path.join(rootPath, "root-feature"),
            "@modules": path.join(rootPath, "modules"),
            "@content-parsing": path.join(rootPath, "content-parsing")
          },
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
      ],
      "react-native-reanimated/plugin"
    ]
  }
}
