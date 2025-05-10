import { BUILD_TYPE } from "@env"
import { registerRootComponent } from "expo"
import Constants from "expo-constants"
import "react-native-get-random-values"
import "TiFShared"

console.log(BUILD_TYPE)

if (BUILD_TYPE === "storybook" || Constants.expoConfig?.extra?.buildType === "development") {
  // @ts-ignore App entry
  const Module = require("./.storybook/App")
  registerRootComponent(Module.default)
} else {
  // @ts-ignore App entry
  const Module = require("./App")
  // @ts-ignore Not inferring the type of "Module" correctly
  Module.setupApp()
  registerRootComponent(Module.default)
}
