package expo.modules.tifhaptics

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import expo.modules.kotlin.types.Enumerable

enum class HapticEvent(val value: String) : Enumerable {
  SELECTION("selection")
}

/**
 * A haptics player for android.
 */
class TiFHapticsEngine(private val vibrator: Vibrator) {
  private var isMuted = false
  private val mutex = Mutex()

  suspend fun play(event: HapticEvent) = mutex.withLock {
    if (isMuted) return
    when (event) {
      HapticEvent.SELECTION -> this.playSelection()
    }
  }

  private fun playSelection() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      vibrator.vibrate(
        VibrationEffect.createWaveform(
          longArrayOf(0, 100),
          intArrayOf(0, 100),
          -1
        )
      )
    } else {
      vibrator.vibrate(longArrayOf(0, 70), -1)
    }
  }

  suspend fun mute() = mutex.withLock {
    isMuted = true
  }

  suspend fun unmute() = mutex.withLock {
    isMuted = false
  }
}