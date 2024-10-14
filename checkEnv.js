/* eslint-disable @typescript-eslint/naming-convention */
const fs = require("fs")
const path = require("path")

const templatePath = path.join(__dirname, ".env.template")
const envPath = path.join(__dirname, ".env")

const parseEnv = (/** @type {fs.PathOrFileDescriptor} */ filePath) => {
  const content = fs.readFileSync(filePath, "utf8")
  return content
    .split("\n")
    .filter((line) => line && line.trim() && !line.startsWith("#"))
    .map((line) => line.split("=")[0].trim())
}

const templateVars = parseEnv(templatePath)
const envVars = parseEnv(envPath)

const missingVars = templateVars.filter((varName) => !envVars.includes(varName))

if (missingVars.length > 0) {
  console.error("Missing environment variables in .env:")
  missingVars.forEach((varName) => console.error(varName))
  process.exit(1)
} else {
  console.log(".env file contains all necessary variables.")
}
