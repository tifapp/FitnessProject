const { withXcodeProject, IOSConfig } = require("@expo/config-plugins")
const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// @ts-check
const withInjectBundledSoundEffects = (config) => {
  return withXcodeProject(config, (config) => {
    const inFiles = fs.readdirSync("./bundled-sound-effects")
    const outFiles = inFiles
      .map((file) => file.replace(".mp3", ".caf"))
      .map((file) => {
        return path.join(
          config.modRequest.platformProjectRoot,
          "FitnessApp",
          file
        )
      })
    for (let i = 0; i < inFiles.length; i++) {
      spawnSync("afconvert", [
        path.join(__dirname, "bundled-sound-effects", inFiles[i]),
        outFiles[i],
        "-d",
        "ima4",
        "-f",
        "caff",
        "-v"
      ])
    }
    IOSConfig.XcodeUtils.ensureGroupRecursively(config.modResults, "Resources")
    for (const font of outFiles) {
      const fontPath = path.relative(
        config.modRequest.platformProjectRoot,
        font
      )
      IOSConfig.XcodeUtils.addResourceFileToGroup({
        filepath: fontPath,
        groupName: "Resources",
        project: config.modResults,
        isBuildFile: true,
        verbose: true
      })
    }
    console.log("Converted Bundled Sound Effects")
    return config
  })
}

module.exports = withInjectBundledSoundEffects
