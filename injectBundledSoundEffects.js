const { withXcodeProject, IOSConfig } = require("@expo/config-plugins")
const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// @ts-ignore
const withInjectBundledSoundEffects = (config) => {
  return withXcodeProject(config, (config) => {
    const soundFiles = fs.readdirSync("./bundled-sound-effects")
      .map(file => {
        const cafFile = file.replace(".mp3", ".caf")
        return {
          source: path.join("bundled-sound-effects", file),
          dest: path.join(
            config.modRequest.platformProjectRoot,
            "FitnessApp",
            cafFile
          )
        }
      })

    const resourcesDir = path.join(
      config.modRequest.platformProjectRoot,
      "FitnessApp"
    )
    if (!fs.existsSync(resourcesDir)) {
      fs.mkdirSync(resourcesDir, { recursive: true })
    }

    for (const file of soundFiles) {
      try {
        const result = spawnSync("afconvert", [
          path.resolve(file.source),
          file.dest,
          "-d",
          "ima4",
          "-f",
          "caff",
          "-v"
        ])

        if (result.error) {
          console.error(`Error converting ${file.source}: ${result.error}`)
          continue
        }

        console.log(`Converted ${file.source} to ${file.dest}`)
      } catch (error) {
        console.error(`Failed to convert ${file.source}: ${error}`)
        continue
      }
    }

    IOSConfig.XcodeUtils.ensureGroupRecursively(config.modResults, "Resources")

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

    console.log("Added converted sound effects to Xcode project")
    return config
  })
}

module.exports = withInjectBundledSoundEffects
