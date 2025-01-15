import { API_URL, BUILD_TYPE } from "@env"
import { registerRootComponent } from "expo"
import "TiFShared"

console.log(API_URL)
console.log(BUILD_TYPE)

if (BUILD_TYPE !== "storybook") {
  // @ts-ignore App entry
  const Module = require("./App")
  Module.setupApp()
  registerRootComponent(Module.default)
} else {
  // @ts-ignore App entry
  const Module = require("./.storybook/App")
  registerRootComponent(Module.default)
}
