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

      // Add the path override at the top of the Podfile
      if (!podfileContent.includes("pod 'TiFNative'")) {
        // First ensure we have the right require statements at the top
        const requireStatement = "require_relative '../node_modules/react-native/scripts/react_native_pods'\n"
        const pathOverride = "pod 'TiFNative', :path => '../native-code/iOS/TiFNative'\n"

        // If the content already has the require statement, add our pod right after it
        if (podfileContent.includes(requireStatement)) {
          podfileContent = podfileContent.replace(
            requireStatement,
            `${requireStatement}\n${pathOverride}`
          )
        } else {
          // If not, add both at the beginning
          podfileContent = `${requireStatement}\n${pathOverride}\n${podfileContent}`
        }

        fs.writeFileSync(podfilePath, podfileContent, "utf8")
        console.log("Injected TiFNative pod path override into Podfile.")
      } else {
        console.log("TiFNative pod is already in the Podfile.")
      }

      return config
    }
  ])
}

module.exports = withTiFNativePod
