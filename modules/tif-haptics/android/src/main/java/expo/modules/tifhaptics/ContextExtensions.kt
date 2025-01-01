package expo.modules.tifhaptics

import android.content.Context
import android.os.Build
import android.os.Vibrator
import android.os.VibratorManager

/**
 * Returns true if haptics are supported on the given device.
 */
val Context.isHapticsSupportedOnDevice: Boolean
  get() = this.defa