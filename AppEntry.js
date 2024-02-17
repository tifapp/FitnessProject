// @ts-nocheck
// @ts-ignore Entry point
import { BUILD_TYPE } from "@env"
import { registerRootComponent } from "expo"

if (BUILD_TYPE !== "storybook") {
  const Module = require("./App")
  Module.setupApp()
  registerRootComponent(Module.default)
} else {
  const Module = require("./.storybook/App")
  registerRootComponent(Module.default)
}
