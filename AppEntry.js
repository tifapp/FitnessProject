// @ts-ignore
import { BUILD_TYPE } from "@env"
import { AppRegistry } from "react-native"
import App from "./App"

if (BUILD_TYPE === "storybook") {
  import("./.storybook/App").then((StorybookAppModule) => {
    AppRegistry.registerComponent("main", () => StorybookAppModule.default)
  })
} else {
  AppRegistry.registerComponent("main", () => App)
}
