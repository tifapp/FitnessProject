/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
const path = require("path");

const modulePath = (/** @type {string} */ dir) => {
  return path.join(__dirname, "..", dir);
};

const MODULES = [
  "components",
  "assets",
  "lib",
  "auth-boundary",
  "event-details-boundary",
  "core-root",
  "location",
  "modules",
  "date-time",
  "test-helpers",
  "content-reporting-boundary",
  "notifications",
  "explore-events-boundary",
  "arrival-tracking",
  "location-search-boundary",
  "event",
  "user",
  "settings-storage",
  "settings-boundary",
  "edit-event-boundary"
];

module.exports = function (/** @type {{ cache: (arg0: boolean) => void; }} */ api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        { moduleName: "@env", path: modulePath(".env"), safe: true }
      ],
      ["@babel/plugin-transform-flow-strip-types"],
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      [
        "module-resolver",
        {
          alias: Object.fromEntries(
            MODULES.map((module) => [`@${module}`, modulePath(module)])
          ),
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
      ],
      ["react-native-reanimated/plugin"]
    ]
  };
};
