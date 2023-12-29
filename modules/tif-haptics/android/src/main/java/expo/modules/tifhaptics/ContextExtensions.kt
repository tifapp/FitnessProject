package expo.modules.tifhaptics

import android.content.Context
import android.os.Build
import android.os.Vibrator
import android.os.VibratorManager

/**
 * The default vibrator provided by the system.
 */
val Context.defaultVibrator: Vibrator
  get() {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      (this.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
      this.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }
  }

/**
 * Returns true if haptics are supported on the given device.
 */
val Context.isHapticsSupportedOnDevice: Boolean
  get() = this.defaultVibrator.hasVibrator()