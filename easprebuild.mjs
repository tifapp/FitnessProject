import fs from "fs"

if (process.env.EAS_BUILD_TYPE !== "development") {
  const storybookPath = ".storybook"

  if (fs.existsSync(storybookPath)) {
    fs.rmdirSync(storybookPath, { recursive: true })
    console.log(`${storybookPath} has been deleted`)
  }
}
