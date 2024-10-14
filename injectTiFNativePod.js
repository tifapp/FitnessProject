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

      const podfileContent = fs.readFileSync(podfilePath, "utf8")

      if (!podfileContent.includes("pod 'TiFNative'")) {
        const targetRegex = /target\s+'([^']+)'s*do/g
        const match = targetRegex.exec(podfileContent)

        if (match && match[1]) {
          const targetName = match[1]
          const podToInject =
            "  pod 'TiFNative', '~> 1.0.0', :path => '../native-code/iOS/TiFNative'\n"

          const updatedPodfileContent = podfileContent.replace(
            `target '${targetName}' do`,
            `target '${targetName}' do\n${podToInject}`
          )

          fs.writeFileSync(podfilePath, updatedPodfileContent, "utf8")
          console.log(`Injected TiFNative pod into target '${targetName}' in Podfile.`)
        } else {
          console.warn("Could not find a valid target in Podfile to inject TiFNative pod.")
        }
      } else {
        console.log("TiFNative pod is already in the Podfile.")
      }

      return config
    }
  ])
}

module.exports = withTiFNativePod
