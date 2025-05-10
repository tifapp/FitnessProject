import fs from "fs"

const { EAS_BUILD_TYPE } = process.env

const directoryPath = "./.storybook"
const appEntryPath = "./AppEntry.js"

// Remove storybook directory if not in development build
if (EAS_BUILD_TYPE !== "development") {
  if (fs.existsSync(directoryPath)) {
    fs.rmdirSync(directoryPath, { recursive: true })
    console.log(`${directoryPath} has been deleted`)
  }

  // Modify AppEntry.js to comment out the storybook require lines
  if (fs.existsSync(appEntryPath)) {
    let appEntryContent = fs.readFileSync(appEntryPath, "utf8")

    // Comment out the two lines that reference storybook
    appEntryContent = appEntryContent.replace(
      /(const Module = require\("\.\/\.storybook\/App"\))/,
      "// $1"
    )
    appEntryContent = appEntryContent.replace(
      /(registerRootComponent\(Module\.default\))/,
      "// $1"
    )

    // Write the modified content back
    fs.writeFileSync(appEntryPath, appEntryContent)
    console.log(`${appEntryPath} has been modified for production build`)
  }
}
