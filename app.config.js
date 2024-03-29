const dotenv = require("dotenv")

dotenv.config({ path: ".env.infra" })

const { MAPS_API, EXPO_PROJECT_ID, EXPO_PROJECT_OWNER } = process.env

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
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "To inform others of your arrival, tap \"Change to Always Allow.\"",
      NSLocationWhenInUseUsageDescription:
        "Discover events and receive travel estimates for events by tapping \"Allow Once\" or \"Allow While Using App.\"",
      UIBackgroundModes: ["location", "fetch"],
      LSApplicationQueriesSchemes: [
        "comgooglemaps",
        "citymapper",
        "uber",
        "lyft",
        "transit",
        "truckmap",
        "waze",
        "yandexnavi",
        "moovit",
        "yandextaxi",
        "yandexmaps",
        "kakaomap",
        "szn-mapy",
        "mapsme",
        "osmandmaps",
        "gett",
        "nmap",
        "dgis",
        "lftgpas"
      ]
    }
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  android: {
    config: {
      googleMaps: {
        apiKey: MAPS_API
      }
    },
    permissions: [
      "ACCESS_BACKGROUND_LOCATION",
      "READ_CALENDAR",
      "WRITE_CALENDAR"
    ],
    package: "com.tifapp.FitnessApp",
    googleServicesFile: "./google-services.json"
  }
}

export default config
