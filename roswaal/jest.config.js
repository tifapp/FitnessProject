// @ts-nocheck
/** @type {import('@jest/types').Config.InitialOptions} */

const fs = require("fs")
const path = require("path")

module.exports = {
  rootDir: "..",
  testMatch: fs
    .readdirSync(__dirname)
    .filter((subdir) => fs.statSync(path.join(__dirname, subdir)).isDirectory())
    .map((subdir) => `<rootDir>/roswaal/${subdir}/*.test.ts`),
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: "detox/runners/jest/globalSetup",
  globalTeardown: "<rootDir>/roswaal/Teardown",
  reporters: ["detox/runners/jest/reporter"],
  testEnvironment: "detox/runners/jest/testEnvironment",
  verbose: true
}
