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

  private val mutex = Mutex()
  private var haptics: TiFHapticsEngine? = null

  override fun definition() = ModuleDefinition {
    Name("TifHaptics")

    Constants {
      mapOf("IS_HAPTICS_SUPPORTED" to context.isHapticsSupportedOnDevice)
    }

    AsyncFunction("play") Coroutine { event: HapticEvent ->
      getHapticsEngine().play(event)
    }

    AsyncFunction("mute") Coroutine { ->
      getHapticsEngine().mute()
    }

    AsyncFunction("unmute") Coroutine { ->
      getHapticsEngine().unmute()
    }
  }

  private suspend fun getHapticsEngine(): TiFHapticsEngine = mutex.withLock {
    val currentHaptics = haptics
    if (currentHaptics != null) return@getHapticsEngine currentHaptics
    val hapticsEngine = TiFHapticsEngine(context.defaultVibrator)
    haptics = hapticsEngine
    hapticsEngine
  }
}