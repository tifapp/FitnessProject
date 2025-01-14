/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: "..",
  testMatch: ["<rootDir>/roswaal/*.test.ts"],
  transformIgnorePatterns: ["node_modules/(?!((jest-)?node-fetch|TiFShared))"],
  testTimeout: 120000,
  maxWorkers: 1,
  verbose: true
}
