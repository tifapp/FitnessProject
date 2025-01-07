package expo.modules.tifhaptics

import android.content.Context
import com.tifapp.tifnative.AndroidHapticsPlayer
import com.tifapp.tifnative.ExpoObject
import com.tifapp.tifnative.isHapticsSupportedOnDevice
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TifHapticsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    val haptics = AndroidHapticsPlayer(context)
    Name("TifHaptics")

    AsyncFunction("play") Coroutine { pattern: ExpoObject ->
      haptics.playPattern(pattern)
    }

    AsyncFunction("apply") Coroutine { settings: ExpoObject ->
      haptics.apply(settings)
    }

    Function("deviceSupport") {
      mapOf(
        "isFeedbackSupportedOnDevice" to context.isHapticsSupportedOnDevice,
        "isAudioSupportedOnDevice" to true
      )
    }
  }
}