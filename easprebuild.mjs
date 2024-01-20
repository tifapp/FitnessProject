import fs from "fs"

const directoryPath = "./.storybook"

if (fs.existsSync(directoryPath)) {
  fs.rmdirSync(directoryPath, { recursive: true })
  console.log(`${directoryPath} has been deleted`)
}
