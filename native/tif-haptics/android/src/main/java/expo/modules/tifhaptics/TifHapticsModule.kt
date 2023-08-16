package expo.modules.tifhaptics

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TifHapticsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TifHaptics")

    Constants(
      "IS_HAPTICS_SUPPORTED" to false
    )

    AsyncFunction("play") {}
    Function("mute") {}
    Function("unmute")
  }
}
