const { withAndroidManifest } = require("expo/config-plugins")
const fs = require("fs")
const path = require("path")

const mapsAPIKey = () => {
  const key = process.env.MAPS_API_KEY
  if (!key) {
    throw new Error(`
No Google Maps API Key was found in .env.infra. Ensure to override the MAPS_API_KEY environment
value with your key. You can obtain an API key from the Google Cloud console.
`)
  }
  return key
}

const GRADLE_SECRETS_PLUGIN =
  // eslint-disable-next-line
  'classpath("com.google.android.libraries.mapsplatform.secrets-gradle-plugin:secrets-gradle-plugin:2.0.1")'

const GRADLE_SECRETS_APPLY_PLUGIN =
  // eslint-disable-next-line
  'apply plugin: "com.google.android.libraries.mapsplatform.secrets-gradle-plugin"\n'

const injectFileContent = (path, target, injection) => {
  let content = fs.readFileSync(path, "utf8")
  if (!content.includes(injection)) {
    content = content.replace(target, `${target}${injection}`)
    fs.writeFileSync(path, content, "utf8")
  }
}

// @ts-ignore
function withGradleSecretsPlugin(config) {
  return withAndroidManifest(config, (config) => {
    const key = mapsAPIKey()
    const secretsPath = path.join(
      config.modRequest.platformProjectRoot,
      "secrets.properties"
    )
    fs.writeFileSync(secretsPath, `MAPS_API_KEY=${key}`)

    const projectBuildGradlePath = path.join(
      config.modRequest.platformProjectRoot,
      "build.gradle"
    )
    const moduleBuildGradlePath = path.join(
      config.modRequest.platformProjectRoot,
      "app/build.gradle"
    )
    injectFileContent(
      projectBuildGradlePath,
      "dependencies {\n",
      `\t\t${GRADLE_SECRETS_PLUGIN}\n`
    )
    console.log("Injected Gradle Secrets Plugin into root build.gradle.")

    injectFileContent(
      moduleBuildGradlePath,
      // eslint-disable-next-line
      'apply plugin: "com.facebook.react"\n',
      GRADLE_SECRETS_APPLY_PLUGIN
    )
    console.log("Injected Gradle Secrets Plugin into module build.gradle.")

    injectFileContent(
      moduleBuildGradlePath,
      GRADLE_SECRETS_APPLY_PLUGIN,
      `
secrets {
  propertiesFileName = "secrets.properties"
}`
    )
    console.log("Injected secrets section into module build.gradle.")
    return config
  })
}

module.exports = withGradleSecretsPlugin
