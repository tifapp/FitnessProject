package expo.modules.tiffs

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoTiFFileSystemModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("ExpoTiFFileSystem")
    Constants(
      "LogsDatabasePath" to Math.PI
    )
  }
}
