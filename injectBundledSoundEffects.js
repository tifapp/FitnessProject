const { withXcodeProject, IOSConfig } = require("@expo/config-plugins")
const fs = require("fs")
const path = require("path")

// @ts-ignore
const withInjectBundledSoundEffects = (config) => {
  return withXcodeProject(config, (config) => {
    // Instead of converting files, we'll just reference the mp3 files directly
    const soundFiles = fs.readdirSync("./bundled-sound-effects")
      .filter(file => file.endsWith(".mp3"))
      .map(file => {
        return {
          source: path.join("bundled-sound-effects", file),
          dest: path.join(
            config.modRequest.platformProjectRoot,
            "FitnessApp",
            file
          )
        }
      })

    // Create Resources directory if it doesn't exist
    const resourcesDir = path.join(
      config.modRequest.platformProjectRoot,
      "FitnessApp"
    )
    if (!fs.existsSync(resourcesDir)) {
      fs.mkdirSync(resourcesDir, { recursive: true })
    }

    // Copy files to the iOS project directory
    for (const file of soundFiles) {
      fs.copyFileSync(file.source, file.dest)
      console.log(`Copied ${file.source} to ${file.dest}`)
    }

    // Ensure the Resources group exists
    IOSConfig.XcodeUtils.ensureGroupRecursively(config.modResults, "Resources")

    // Add files to Xcode project
    for (const file of soundFiles) {
      const relativePath = path.relative(
        config.modRequest.platformProjectRoot,
        file.dest
      )
      IOSConfig.XcodeUtils.addResourceFileToGroup({
        filepath: relativePath,
        groupName: "Resources",
        project: config.modResults,
        isBuildFile: true,
        verbose: true
      })
    }

    console.log("Added sound effects to Xcode project")
    return config
  })
}

module.exports = withInjectBundledSoundEffects
