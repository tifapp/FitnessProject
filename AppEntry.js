// @ts-ignore Entry point
import { BUILD_TYPE } from "@env"
import { registerRootComponent } from "expo"

if (BUILD_TYPE === "storybook") {
  import("./.storybook/App").then((Module) => {
    registerRootComponent(Module.default)
  })
} else {
  import("./App").then((Module) => {
    // @ts-ignore App type doesn't match registerRootComponent type, but it still works
    registerRootComponent(Module.default)
  })
}
