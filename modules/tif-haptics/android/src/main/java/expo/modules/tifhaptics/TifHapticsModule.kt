package expo.modules.tifhaptics

import android.content.Context
import android.os.Build
import android.os.Vibrator
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TifHapticsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val haptics = AndroidHapticsPlayer(context)

  override fun definition() = ModuleDefinition {
    Name("TifHaptics")

    AsyncFunction("play") Coroutine { event: ExpoObject ->
      haptics.play(event)
    }

    AsyncFunction("apply") Coroutine { event: ExpoObject -> 
      haptics.apply(event)
    }

    Function("deviceSupport") { 
       mapOf("isFeedbackSupportedOnDevice" to context.isHapticsSupportedOnDevice, "isAudioSupportedOnDevice" to true)
    }
  }
}