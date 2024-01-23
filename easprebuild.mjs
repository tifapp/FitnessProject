import fs from "fs"

const { EAS_BUILD_TYPE } = process.env

const directoryPath = "./.storybook"

if (EAS_BUILD_TYPE !== "development" && fs.existsSync(directoryPath)) {
  fs.rmdirSync(directoryPath, { recursive: true })
  console.log(`${directoryPath} has been deleted`)
}
