import dotenv from "dotenv"

dotenv.config({ path: ".env.infra" })

const { MAPS_API_KEY, EXPO_PROJECT_ID, EXPO_PROJECT_OWNER, EAS_BUILD_TYPE } =
  process.env

const { bundleIdentifier, icon, splash, name } =
  EAS_BUILD_TYPE === "development"
    ? {
        bundleIdentifier: "com.tifapp.FitnessAppDevelopment",
        icon: ".storybook/assets/icon.png",
        splash: ".storybook/assets/splash.png",
        name: "FitnessAppDevelopment"
      }
    : EAS_BUILD_TYPE === "preview"
      ? {
          bundleIdentifier: "com.tifapp.FitnessAppPreview",
          icon: "./assets/icon.png",
          splash: "./assets/splash.png",
          name: "FitnessAppPreview"
        }
      : {
          bundleIdentifier: "com.tifapp.FitnessApp",
          icon: "./assets/icon.png",
          splash: "./assets/splash.png",
          name: "FitnessApp"
        }

const config = {
  name,
  slug: "FitnessApp",
  scheme: "tifapp",
  version: "1.0.0",
  orientation: "portrait",
  icon,
  splash: {
    image: splash,
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
  plugins: [
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io",
        organization: "tif-a7",
        project: "react-native"
      }
    ],
    "expo-font",
    "expo-secure-store",
    "expo-asset"
  ],
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier,
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'To inform others of your arrival, tap "Change to Always Allow."',
      NSLocationWhenInUseUsageDescription:
        'Discover events and receive travel estimates for events by tapping "Allow Once" or "Allow While Using App."',
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
  android: {
    package: bundleIdentifier,
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
