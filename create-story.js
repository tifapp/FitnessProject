const fs = require("fs")
const path = require("path")

const COMPONENTS_DIR = path.resolve(__dirname, "components")
const STORYBOOK_FILE = path.resolve(__dirname, ".storybook/.ondevice/Storybook.tsx")

// Helper to add import and story entry
function addStoryToStorybook(storyName, componentName) {
  let storybookContent = fs.readFileSync(STORYBOOK_FILE, "utf-8")
  const importStatement = `import ${storyName}Meta, { Basic as ${componentName} } from "../components/${storyName}/${storyName}.stories";`

  // Add import at the top
  if (!storybookContent.includes(importStatement)) {
    const firstImportIndex = storybookContent.indexOf("import")
    const nextLineIndex = storybookContent.indexOf("\n", firstImportIndex)
    storybookContent = [
      storybookContent.slice(0, nextLineIndex + 1),
      importStatement,
      storybookContent.slice(nextLineIndex + 1)
    ].join("\n")
  }

  // Add to the `stories` array
  const storiesArrayStartIndex = storybookContent.indexOf("const stories = [")
  if (storiesArrayStartIndex === -1) {
    console.error("Error: Could not find `stories` array in Storybook.tsx.")
    process.exit(1)
  }

  const storiesArrayEndIndex = storybookContent.indexOf("];", storiesArrayStartIndex)
  const insertionPoint = storybookContent.lastIndexOf("},", storiesArrayEndIndex)
  const insertionOffset = insertionPoint !== -1 ? insertionPoint + 2 : storiesArrayStartIndex + "const stories = [".length

  const storyEntry = `  {
    name: ${storyName}Meta.title,
    component: ${componentName},
    args: ${storyName}Meta.args
  },`

  storybookContent = [
    storybookContent.slice(0, insertionOffset),
    storyEntry,
    storybookContent.slice(insertionOffset)
  ].join("\n")

  fs.writeFileSync(STORYBOOK_FILE, storybookContent, "utf-8")
}

// Helper to create component folder and stories file
function createComponentFolder(storyName) {
  const storyFolderPath = path.join(COMPONENTS_DIR, storyName)
  if (!fs.existsSync(storyFolderPath)) {
    fs.mkdirSync(storyFolderPath, { recursive: true })
  }

  const storiesFileContent = `import React from "react";
import { StoryMeta } from "storybook/HelperTypes";

export const ${storyName}Meta: StoryMeta = {
  title: "${storyName}",
};

export default ${storyName}Meta;

export const Basic = () => <div>${storyName}</div>;
`

  const storiesFilePath = path.join(storyFolderPath, `${storyName}.stories.tsx`)
  fs.writeFileSync(storiesFilePath, storiesFileContent, "utf-8")
}

// Main
const args = process.argv.slice(2)
if (args.length !== 2) {
  console.error("Usage: npm run create-story <StoryName> <ComponentName>")
  process.exit(1)
}

const [storyName, componentName] = args
createComponentFolder(storyName)
addStoryToStorybook(storyName, componentName)

console.log(`Story "${storyName}" created successfully.`)
