module.exports = {
  verbose: true,
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest/setupNav.js"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"]
}
