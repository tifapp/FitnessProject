const { iosConfig, androidConfig } = require("../appconfighelper")
const dotenv = require("dotenv")

dotenv.config({ path: "../.env.infra" })

const { MAPS_API_KEY, EXPO_PROJECT_STORYBOOK_ID, EXPO_PROJECT_OWNER } =
  process.env

const config = {
  name: "FitnessAppStorybook",
  slug: "fitnessappstorybook",
  scheme: "tifappstorybook",
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
      projectId: EXPO_PROJECT_STORYBOOK_ID
    }
  },
  plugins: [],
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.tifapp.FitnessAppStorybook",
    ...iosConfig
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  android: {
    package: "com.tifapp.FitnessAppStorybook",
    config: {
      googleMaps: {
        apiKey: MAPS_API_KEY
      }
    },
    ...androidConfig
  }
}

export default config
