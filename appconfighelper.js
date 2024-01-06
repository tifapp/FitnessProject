// can't export these from app.config.js

module.exports = {
  iosConfig: {
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
  androidConfig: {
    permissions: [
      "ACCESS_BACKGROUND_LOCATION",
      "READ_CALENDAR",
      "WRITE_CALENDAR"
    ],
    googleServicesFile: "./google-services.json"
  }
}
