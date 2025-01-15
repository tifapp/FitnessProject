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
        const requireStatement = "require_relative '../node_modules/react-native/scripts/react_native_pods'\n"
        const pathOverride = "pod 'TiFNative', :path => '../native-code/iOS/TiFNative'\n"

        if (podfileContent.includes(requireStatement)) {
          podfileContent = podfileContent.replace(
            requireStatement,
            `${requireStatement}\n${pathOverride}`
          )
        } else {
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
