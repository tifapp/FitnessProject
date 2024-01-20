const { MAPS_API_KEY, EXPO_PROJECT_ID, EXPO_PROJECT_OWNER, EAS_BUILD_TYPE } =
  process.env

const bundleIdentifier =
  EAS_BUILD_TYPE === "development"
    ? "com.tifapp.FitnessAppDevelopment"
    : EAS_BUILD_TYPE === "preview"
      ? "com.tifapp.FitnessAppPreview"
      : "com.tifapp.FitnessApp"

const googleServicesFile =
  EAS_BUILD_TYPE === "development"
    ? "./development-google-services.json"
    : EAS_BUILD_TYPE === "preview"
      ? "./preview-google-services.json"
      : "./google-services.json"

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
    bundleIdentifier,
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
    package: bundleIdentifier,
    googleServicesFile,
    config: {
      googleMaps: {
        apiKey: MAPS_API_KEY
      }
    },
    permissions: [
      "ACCESS_BACKGROUND_LOCATION",
      "READ_CALENDAR",
      "WRITE_CALENDAR"
    ]
  }
}

export default config
