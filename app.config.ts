import * as dotenv from "dotenv"

dotenv.config()

const { MAPS_API } = process.env

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
  plugins: ["sentry-expo"],
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.tifapp.FitnessApp",
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription: "REASON_FOR_REQUEST",
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
    useNextNotificationsApi: true,
    googleServicesFile: "./google-services.json"
  }
}

export default config
