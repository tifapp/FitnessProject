const { iosConfig, androidConfig } = require("./appconfighelper")
const dotenv = require("dotenv")

dotenv.config({ path: ".env.infra" })

const { MAPS_API_KEY, EXPO_PROJECT_ID, EXPO_PROJECT_OWNER } = process.env

const config = {
  name: "FitnessApp",
  slug: "FitnessApp",
  scheme: "tifapp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  owner: EXPO_PROJECT_OWNER,
  extra: {
    eas: {
      projectId: EXPO_PROJECT_ID
    }
  },
  plugins: ["sentry-expo"],
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.tifapp.FitnessApp",
    ...iosConfig
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  android: {
    package: "com.tifapp.FitnessApp",
    ...androidConfig
  }
}

export default config
