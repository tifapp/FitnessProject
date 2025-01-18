const { withDangerousMod } = require("@expo/config-plugins")
const fs = require("fs")
const path = require("path")

// @ts-ignore
function withTiFNativeAndroid(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const settingsGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        "settings.gradle"
      )

      let settingsContent = fs.readFileSync(settingsGradlePath, "utf8")
      const includeBuildStatement = "includeBuild \"../native-code/Android/TiFNative\""

      if (!settingsContent.includes(includeBuildStatement)) {
        const lines = settingsContent.split("\n")
        lines.splice(-1, 0, includeBuildStatement)
        settingsContent = lines.join("\n")
        fs.writeFileSync(settingsGradlePath, settingsContent, "utf8")
        console.log("Added TiFNative includeBuild to settings.gradle")
      } else {
        console.log("TiFNative includeBuild already exists in settings.gradle")
      }

      const buildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        "app/build.gradle"
      )

      let buildContent = fs.readFileSync(buildGradlePath, "utf8")
      const dependencyLine = "    implementation \"com.tifapp:TiFNative\""

      if (!buildContent.includes(dependencyLine)) {
        const dependenciesMatch = buildContent.match(/dependencies\s*{[^}]*}/)
        if (dependenciesMatch) {
          const dependenciesBlock = dependenciesMatch[0]
          const updatedDependencies = dependenciesBlock.replace(
            /}$/,
            `${dependencyLine}\n}`
          )
          buildContent = buildContent.replace(dependenciesBlock, updatedDependencies)
          fs.writeFileSync(buildGradlePath, buildContent, "utf8")
          console.log("Added TiFNative implementation to build.gradle")
        } else {
          console.warn("Could not find dependencies block in build.gradle")
        }
      } else {
        console.log("TiFNative implementation already exists in build.gradle")
      }

      return config
    }
  ])
}

module.exports = withTiFNativeAndroid
