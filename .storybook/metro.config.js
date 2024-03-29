const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const blacklist = require("metro-config/src/defaults/exclusionList");
module.exports = {
  resolver: {
    blacklistRE: blacklist([/#current-cloud-backend\/.*/]),
  },
};

const defaultConfig = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, "..");
defaultConfig.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});
(defaultConfig.resolver.blacklistRE = blacklist([
  /#current-cloud-backend\/.*/,
])),
  (defaultConfig.resolver.resolverMainFields = [
    "sbmodern",
    "react-native",
    "browser",
    "main",
  ]);
defaultConfig.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
defaultConfig.resolver.disableHierarchicalLookup = true;
defaultConfig.watchFolders = [workspaceRoot];

module.exports = defaultConfig;
