// withTiFNativePod.js
const { withDangerousMod } = require("@expo/config-plugins")
const fs = require("fs")
const path = require("path")

// @ts-ignore
function withTiFNativePod(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      )

      let podfileContent = fs.readFileSync(podfilePath, "utf8")

      if (!podfileContent.includes("pod 'TiFNative'")) {
        const targetString = "target 'FitnessApp' do"
        const podToInject =
          "  pod 'TiFNative', :path => '../native-code/iOS/TiFNative'\n"
        podfileContent = podfileContent.replace(
          targetString,
          `${targetString}\n${podToInject}`
        )
        fs.writeFileSync(podfilePath, podfileContent, "utf8")
        console.log("Injected TiFNative pod into Podfile.")
      } else {
        console.log("TiFNative pod is already in the Podfile.")
      }

      return config
    }
  ])
}

module.exports = withTiFNativePod
