import { registerRootComponent } from "expo"
import "TiFShared"

const Module = require("./.storybook/App")
registerRootComponent(Module.default)
