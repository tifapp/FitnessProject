import { existsSync, writeFileSync } from "fs"
import { join } from "path"

const switchToStorybookEntry = () => {
  const appFilePath = join(__dirname, "..", "App.tsx")
  const storybookContent = `
  import CustomStorybookUI from "./.storybook/.ondevice/Storybook";

  export default CustomStorybookUI;`

  if (!existsSync(appFilePath)) {
    console.error("App.tsx not found. Ensure you are in the correct directory.")
    return
  }

  writeFileSync(appFilePath, storybookContent, "utf8")
}

if (process.env.BUILD_TYPE === "storybook") {
  switchToStorybookEntry()
}
