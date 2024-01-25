/* eslint-disable @typescript-eslint/naming-convention */
const fs = require("fs")
const path = require("path")
const envPath = path.join(__dirname, ".env")

/**
 * @param {boolean} addBuildType
 */
function modifyEnv (addBuildType) {
  let envContent = fs.readFileSync(envPath, { encoding: "utf8" })
  const buildTypeLine = "BUILD_TYPE=storybook"
  const hasBuildType = envContent.includes(buildTypeLine)

  if (addBuildType && !hasBuildType) {
    envContent += `\n${buildTypeLine}`
  } else if (!addBuildType && hasBuildType) {
    envContent = envContent.replace(buildTypeLine, "")
  }

  fs.writeFileSync(envPath, envContent)
}

modifyEnv(process.argv[2] === "true")
