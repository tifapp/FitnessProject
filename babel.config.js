// @ts-nocheck
/* eslint-disable comma-dangle */
/* eslint-disable semi */
const path = require("path");
const rootPath = __dirname;

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
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
          },
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
